import Stripe from "stripe";

const stripeOptions = {
  apiVersion: "2026-05-27.dahlia" as const,
  typescript: true as const,
  maxNetworkRetries: 3,
  timeout: 30_000,
  appInfo: {
    name: "Explore Malta Rentals",
    version: "1.0.0",
    url: "https://exploremaltarentals.com",
  },
};

let stripeClient: Stripe | undefined;

function createStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }

  return new Stripe(secretKey, stripeOptions);
}

/** Lazily creates the Stripe client so Next.js build can import Stripe modules safely. */
export function getStripe(): Stripe {
  stripeClient ??= createStripeClient();
  return stripeClient;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = client[prop as keyof Stripe];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
