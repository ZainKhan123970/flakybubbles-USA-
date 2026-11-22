const crypto = require('crypto');

// Stripe needs the raw request body to verify the signature.
module.exports.config = { api: { bodyParser: false } };

const readRaw = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

function verify(raw, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')));
  const t = parts.t;
  const sig = parts.v1;
  if (!t || !sig) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw.toString('utf8')}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.log('Email skipped (RESEND_API_KEY / EMAIL_FROM not set):', subject);
    return;
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html, reply_to: replyTo }),
  });
  if (!r.ok) console.error('Resend error', r.status, await r.text());
}

function detailsTable(m, total) {
  const rows = [
    ['Trip', m.trip],
    ['Purpose', m.purpose],
    ['Pick-up address', m.pickup],
    ['Drop-off address', m.dropoff],
    ['Distance', m.miles ? m.miles + ' miles' : ''],
    ['Pick-up', m.pickup_when],
    ['Return', m.return_when],
    ['Pet', m.pet],
    ['Pet notes', m.pet_notes],
    ['Hand-over at pick-up', m.pickup_contact],
    ['Receiving at drop-off', m.drop_contact],
    ['Driver notes', m.driver_notes],
    ['Total paid', total],
  ].filter((r) => r[1]);
  return `<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">${rows
    .map((r) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#627068;width:38%">${esc(r[0])}</td><td style="padding:6px 10px;border-bottom:1px solid #eee"><b>${esc(r[1])}</b></td></tr>`)
    .join('')}</table>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).send('Webhook secret not configured');

  const raw = await readRaw(req);
  if (!verify(raw, req.headers['stripe-signature'], secret)) return res.status(400).send('Invalid signature');

  let event;
  try {
    event = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).send('Bad payload');
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const m = s.metadata || {};
    if (m.booking_type === 'pet_transport' && s.payment_status === 'paid') {
      const total = `$${(s.amount_total / 100).toFixed(2)}`;
      const table = detailsTable(m, total);
      try {
        await sendEmail({
          to: s.customer_details?.email || m.email,
          subject: 'Your Flaky Bubbles pet transport is booked',
          replyTo: process.env.NOTIFY_EMAIL,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px"><h2 style="color:#456553">Thank you, ${esc(m.owner)}!</h2><p>Your payment was received and your pet's ride is confirmed. Our team will contact you if anything needs adjusting.</p>${table}<p style="font-size:13px;color:#627068">Questions? Reply to this email or call +1 (682) 351 8650.</p></div>`,
        });
        if (process.env.NOTIFY_EMAIL) {
          await sendEmail({
            to: process.env.NOTIFY_EMAIL,
            subject: `New PAID transport booking: ${m.owner} - ${m.pickup_when}`,
            replyTo: m.email,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px"><h2>New paid transport booking</h2><p>Phone: <b>${esc(m.phone)}</b><br>Email: <b>${esc(m.email)}</b><br>Stripe session: ${esc(s.id)}</p>${table}</div>`,
          });
        }
      } catch (e) {
        console.error('Email failure', e);
      }
    }
  }
  return res.status(200).json({ received: true });
};
