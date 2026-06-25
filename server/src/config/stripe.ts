import Stripe from 'stripe';
import { env } from './env';

// One configured Stripe client for the whole server. The SDK pins its own API
// version; we pass only the secret key (test mode).
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
