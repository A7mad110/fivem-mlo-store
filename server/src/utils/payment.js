const config = require('../config');

let stripe;
try {
  stripe = require('stripe')(config.stripe.secretKey);
} catch (e) {
  console.warn('Stripe not configured');
}

const createStripePaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  if (!stripe) throw new Error('Stripe not configured');
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
};

const constructStripeWebhook = (body, signature) => {
  if (!stripe) throw new Error('Stripe not configured');
  return stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
};

module.exports = { createStripePaymentIntent, constructStripeWebhook };
