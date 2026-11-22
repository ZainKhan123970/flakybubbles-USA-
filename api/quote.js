const { clean, validate, priceFor, fail } = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const d = clean(req.body || {});
    validate(d, false);
    const q = await priceFor(d);
    return res.status(200).json(q);
  } catch (e) {
    return fail(res, e);
  }
};
