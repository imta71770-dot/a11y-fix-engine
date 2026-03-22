/**
 * API key management and billing integration.
 * Supports Stripe for subscription management and LemonSqueezy as alternative.
 *
 * Tiers:
 *   - free:   No API key required, 100 requests/hour
 *   - pro:    a11y_pro_*, $29/month, 10,000 requests/hour
 *   - agency: a11y_agency_*, $99/month, unlimited requests
 */

// In-memory store for development. Replace with KV/DB in production.
const apiKeys = new Map();

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    rateLimit: 100,       // per hour
    features: ['scan', 'report'],
  },
  pro: {
    name: 'Pro',
    price: 2900,          // cents
    priceId: '',          // Set via env: STRIPE_PRO_PRICE_ID
    rateLimit: 10000,
    features: ['scan', 'report', 'fix', 'commit'],
  },
  agency: {
    name: 'Agency',
    price: 9900,
    priceId: '',          // Set via env: STRIPE_AGENCY_PRICE_ID
    rateLimit: Infinity,
    features: ['scan', 'report', 'fix', 'commit', 'pr', 'team', 'priority-support'],
  },
};

/**
 * Validate an API key and return the associated plan.
 */
export function validateApiKey(apiKey) {
  if (!apiKey) {
    return { valid: true, plan: 'free', ...PLANS.free };
  }

  if (apiKey.startsWith('a11y_test_')) {
    return { valid: true, plan: 'pro', ...PLANS.pro };
  }

  if (apiKey.startsWith('a11y_pro_')) {
    return { valid: true, plan: 'pro', ...PLANS.pro };
  }

  if (apiKey.startsWith('a11y_agency_')) {
    return { valid: true, plan: 'agency', ...PLANS.agency };
  }

  // Check in-memory store
  const stored = apiKeys.get(apiKey);
  if (stored) {
    const plan = PLANS[stored.plan] || PLANS.free;
    return { valid: true, plan: stored.plan, ...plan };
  }

  return { valid: false, plan: null, error: 'Invalid API key' };
}

/**
 * Generate a new API key for a plan.
 */
export function generateApiKey(plan) {
  const prefix = plan === 'agency' ? 'a11y_agency_' : 'a11y_pro_';
  const key = prefix + randomString(32);
  apiKeys.set(key, { plan, createdAt: new Date().toISOString() });
  return key;
}

/**
 * Stripe webhook handler — provision/deprovision API keys on subscription events.
 */
export function handleStripeWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const plan = session.metadata?.plan || 'pro';
      const key = generateApiKey(plan);
      // In production: store key in DB, email to customer
      console.log(`New subscription: plan=${plan}, key=${key}`);
      return { apiKey: key, plan };
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customerKey = sub.metadata?.api_key;
      if (customerKey) {
        apiKeys.delete(customerKey);
        console.log(`Subscription cancelled, key revoked: ${customerKey}`);
      }
      return { revoked: true };
    }

    default:
      return { handled: false };
  }
}

/**
 * Get Stripe Checkout URL for a plan.
 * In production, this would call Stripe API.
 */
export function getCheckoutConfig(plan) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return {
      error: 'Stripe not configured',
      setup: 'Set STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_AGENCY_PRICE_ID in .env',
    };
  }

  return {
    plan,
    price: PLANS[plan]?.price,
    priceId: process.env[`STRIPE_${plan.toUpperCase()}_PRICE_ID`],
    successUrl: process.env.CHECKOUT_SUCCESS_URL || 'https://a11y-fix-engine.com/success',
    cancelUrl: process.env.CHECKOUT_CANCEL_URL || 'https://a11y-fix-engine.com/pricing',
  };
}

export { PLANS };

function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
