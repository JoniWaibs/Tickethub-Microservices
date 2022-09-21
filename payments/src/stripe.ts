import Stripe from 'stripe';

/**
 * Stripe initial config
 */
export const stripe = new Stripe(process.env.STIPE_KEY!, { apiVersion: '2022-08-01' });
