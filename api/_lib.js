// Shared pricing + validation logic. Files starting with "_" are NOT exposed as API routes by Vercel.

// ---- EDIT YOUR PRICING HERE (placeholders, change to your real rates) ----
const CFG = {
  baseFee: 25,              // USD, includes the first `includedMiles`
  includedMiles: 5,
  perMile: 2.0,             // USD per mile after included miles
  roundTripMultiplier: 1.8, // round trip = one-way price x 1.8
  extraPet: 10,             // per additional pet
  largeDogLbs: 50,          // at or above this weight -> large dog fee
  largeDog: 10,
  afterHours: 15,           // pickup/return before openHour or at/after closeHour
  openHour: 9,
  closeHour: 18,
  maxMiles: 30,             // service radius (one-way driving miles)
  taxRate: 0,               // e.g. 0.0825 for 8.25% (ask your accountant)
  currency: 'usd',
  timeZone: 'America/Chicago',
};

class UserError extends Error {}

const str = (v, max = 200) =>
  String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

function clean(b) {
  return {
    tripType: b.tripType === 'round' ? 'round' : 'oneway',
    purpose: str(b.purpose, 60),
    pickup: str(b.pickup, 200),
    dropoff: str(b.dropoff, 200),
    date: str(b.date, 10),
    time: str(b.time, 5),
    returnDate: str(b.returnDate, 10),
    returnTime: str(b.returnTime, 5),
    ownerName: str(b.ownerName, 80),
    phone: str(b.phone, 30),
    email: str(b.email, 120),
    petName: str(b.petName, 60),
    petType: str(b.petType, 20),
    breed: str(b.breed, 60),
    weight: Number(b.weight),
    pets: parseInt(b.pets, 10) || 1,
    petNotes: str(b.petNotes, 300),
    pickupContact: str(b.pickupContact, 80),
    pickupContactPhone: str(b.pickupContactPhone, 30),
    dropContact: str(b.dropContact, 80),
    dropContactPhone: str(b.dropContactPhone, 30),
    driverNotes: str(b.driverNotes, 300),
    website: str(b.website, 50), // honeypot
    agreed: b.agreed === true,
  };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function today() {
  return new Date().toLocaleDateString('en-CA', { timeZone: CFG.timeZone });
}

function validate(d, full) {
  if (d.website) throw new UserError('Invalid request.');
  if (d.pickup.length < 8 || d.dropoff.length < 8) throw new UserError('Please enter complete pick-up and drop-off addresses (street, city, state, ZIP).');
  if (!DATE_RE.test(d.date) || d.date < today()) throw new UserError('Please choose a valid pick-up date (today or later).');
  if (!TIME_RE.test(d.time)) throw new UserError('Please choose a pick-up time.');
  if (d.tripType === 'round') {
    if (!DATE_RE.test(d.returnDate) || d.returnDate < d.date) throw new UserError('Return date cannot be before the pick-up date.');
    if (!TIME_RE.test(d.returnTime)) throw new UserError('Please choose a return time.');
  }
  if (!(d.weight > 0 && d.weight <= 300)) throw new UserError('Please enter your pet\'s approximate weight in lbs.');
  if (d.pets < 1 || d.pets > 4) throw new UserError('You can book up to 4 pets per ride.');
  if (full) {
    if (!d.ownerName || d.phone.replace(/\D/g, '').length < 10) throw new UserError('Please enter your name and a valid phone number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) throw new UserError('Please enter a valid email address.');
    if (!d.petName) throw new UserError('Please enter your pet\'s name.');
    if (!d.agreed) throw new UserError('Please accept the terms to continue.');
  }
}

async function getMiles(origin, dest) {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY is not set');
  const r = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'originIndex,destinationIndex,distanceMeters,status,condition',
    },
    body: JSON.stringify({
      origins: [{ waypoint: { address: origin } }],
      destinations: [{ waypoint: { address: dest } }],
      travelMode: 'DRIVE',
    }),
  });
  const j = await r.json().catch(() => null);
  const el = Array.isArray(j) ? j[0] : null;
  if (!r.ok && !el) throw new Error('Routes API error: ' + JSON.stringify(j));
  if (!el || el.condition !== 'ROUTE_EXISTS' || !el.distanceMeters) {
    throw new UserError('We could not find a driving route between those addresses. Please check them and include city, state and ZIP.');
  }
  return el.distanceMeters / 1609.344;
}

const isAfterHours = (t) => {
  if (!TIME_RE.test(t || '')) return false;
  const h = parseInt(t.slice(0, 2), 10);
  return h < CFG.openHour || h >= CFG.closeHour;
};

function calculate(d, miles) {
  const lines = [];
  const extraMiles = Math.max(0, miles - CFG.includedMiles);
  const base = Math.round(CFG.baseFee * 100);
  const dist = Math.round(extraMiles * CFG.perMile * 100);
  lines.push({ label: `Base fare (first ${CFG.includedMiles} miles included)`, amount: base });
  if (dist > 0) lines.push({ label: `Distance (${extraMiles.toFixed(1)} extra miles)`, amount: dist });
  let subtotal = base + dist;
  if (d.tripType === 'round') {
    const rt = Math.round((base + dist) * (CFG.roundTripMultiplier - 1));
    lines.push({ label: 'Return trip', amount: rt });
    subtotal += rt;
  }
  if (d.pets > 1) {
    const a = (d.pets - 1) * Math.round(CFG.extraPet * 100);
    lines.push({ label: `Additional pet${d.pets > 2 ? 's' : ''} (${d.pets - 1})`, amount: a });
    subtotal += a;
  }
  if (d.weight >= CFG.largeDogLbs) {
    const a = Math.round(CFG.largeDog * 100);
    lines.push({ label: `Large pet (${CFG.largeDogLbs} lbs+)`, amount: a });
    subtotal += a;
  }
  if (isAfterHours(d.time) || (d.tripType === 'round' && isAfterHours(d.returnTime))) {
    const a = Math.round(CFG.afterHours * 100);
    lines.push({ label: 'After-hours pick-up/return', amount: a });
    subtotal += a;
  }
  let total = subtotal;
  if (CFG.taxRate > 0) {
    const tax = Math.round(subtotal * CFG.taxRate);
    lines.push({ label: `Sales tax (${(CFG.taxRate * 100).toFixed(2)}%)`, amount: tax });
    total += tax;
  }
  return { miles: Math.round(miles * 10) / 10, lines, total, currency: CFG.currency };
}

async function priceFor(d) {
  const miles = await getMiles(d.pickup, d.dropoff);
  if (miles > CFG.maxMiles) {
    throw new UserError(`That trip is about ${miles.toFixed(0)} miles, which is outside our ${CFG.maxMiles}-mile service area. Please call us for a custom quote.`);
  }
  return calculate(d, miles);
}

function fail(res, e) {
  if (e instanceof UserError) return res.status(400).json({ error: e.message });
  console.error(e);
  return res.status(500).json({ error: 'Something went wrong on our side. Please try again or call us.' });
}

module.exports = { CFG, UserError, clean, validate, priceFor, fail, str };
