import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30_000,
  appInfo: {
    name: "Explore Malta Rentals",
    version: "1.0.0",
    url: "https://exploremaltarentals.com",
  },
});
