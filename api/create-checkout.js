const { clean, validate, priceFor, fail, str } = require('./_lib');

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
    const d = clean(req.body || {});
    validate(d, true);

    // Price is ALWAYS recalculated on the server. Anything the browser sends about price is ignored.
    const q = await priceFor(d);

    const site = (process.env.SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
    const p = new URLSearchParams();
    p.append('mode', 'payment');
    p.append('success_url', `${site}/transport-success.html?session_id={CHECKOUT_SESSION_ID}`);
    p.append('cancel_url', `${site}/transport-booking.html?cancelled=1`);
    p.append('customer_email', d.email);

    q.lines.forEach((l, i) => {
      p.append(`line_items[${i}][quantity]`, '1');
      p.append(`line_items[${i}][price_data][currency]`, q.currency);
      p.append(`line_items[${i}][price_data][unit_amount]`, String(l.amount));
      p.append(`line_items[${i}][price_data][product_data][name]`, l.label);
    });

    const trip = d.tripType === 'round' ? 'Round trip' : 'One way';
    const meta = {
      booking_type: 'pet_transport',
      trip,
      purpose: d.purpose,
      pickup: d.pickup,
      dropoff: d.dropoff,
      miles: String(q.miles),
      pickup_when: `${d.date} ${fmtTime(d.time)}`,
      return_when: d.tripType === 'round' ? `${d.returnDate} ${fmtTime(d.returnTime)}` : '',
      owner: d.ownerName,
      phone: d.phone,
      email: d.email,
      pet: `${d.petName} (${d.petType}${d.breed ? ', ' + d.breed : ''}, ${d.weight} lbs, ${d.pets} pet${d.pets > 1 ? 's' : ''})`,
      pet_notes: d.petNotes,
      pickup_contact: d.pickupContact ? `${d.pickupContact} ${d.pickupContactPhone}` : 'Owner',
      drop_contact: d.dropContact ? `${d.dropContact} ${d.dropContactPhone}` : 'Owner',
      driver_notes: d.driverNotes,
    };
    for (const [k, v] of Object.entries(meta)) p.append(`metadata[${k}]`, str(v, 480));
    p.append('payment_intent_data[description]', `Pet transport - ${d.petName} - ${d.date}`);

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: p,
    });
    const j = await r.json();
    if (!r.ok) throw new Error('Stripe error: ' + JSON.stringify(j));
    return res.status(200).json({ url: j.url });
  } catch (e) {
    return fail(res, e);
  }
};
