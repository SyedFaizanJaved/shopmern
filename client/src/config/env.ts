// Vite exposes env vars prefixed with VITE_ on import.meta.env (statically
// replaced at build time). Validate once so a missing value fails loudly.
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

if (!apiUrl) {
  throw new Error('VITE_API_URL is not set — add it to client/.env');
}
if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not set — add it to client/.env');
}

export const env = { apiUrl, stripePublishableKey } as const;
