# Flaky Bubbles - Paid Transport Booking

## Files (copy into the ROOT of your website project, same folder as index.html)

- transport-booking.html - the booking form (3 steps: trip, you and your pet, price and pay)
- transport-success.html - page shown after successful payment
- api/_lib.js - pricing rules and validation (EDIT PRICES HERE)
- api/quote.js - returns the live price
- api/create-checkout.js - creates the Stripe Checkout session
- api/stripe-webhook.js - confirms payment, sends emails
- .env.example - list of environment variables

## 1. Point the buttons to the new form

In service-transport.html (and the Pet Transport card in index.html) replace the transport
buttons' link `https://flakybubbles.portal.gingrapp.com` with `transport-booking.html`
(Book Now, Book a Ride). Remove target="_blank" rel="noopener" from those two links.

## 2. Environment variables (Vercel)

Add every variable from .env.example in Vercel > Settings > Environment Variables, then redeploy.

## 3. Stripe webhook

Stripe Dashboard > Developers > Webhooks > Add endpoint:
- URL: https://yourdomain.com/api/stripe-webhook
- Event: checkout.session.completed
- Copy the Signing secret into STRIPE_WEBHOOK_SECRET

## 4. Test before going live

Use test keys and card 4242 4242 4242 4242 (any future date, any CVC). Check you get both emails.
Then switch to live keys (sk_live_...), create the live webhook, update the env vars, redeploy.

## 5. Prices

Edit the CFG block at the top of api/_lib.js (base fee, per-mile rate, extras, service radius, tax).
The price is always calculated on the server, never trusted from the browser.
