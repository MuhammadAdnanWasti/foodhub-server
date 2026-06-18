import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export const envVars = {
  STRIPE: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    SUCCESS_URL:
      process.env.STRIPE_SUCCESS_URL ||
      process.env.SUCCESS_URL ||
      'http://localhost:3000/payment/success',
    CANCEL_URL:
      process.env.STRIPE_CANCEL_URL ||
      process.env.CANCEL_URL ||
      'http://localhost:3000/payment/cancel',
  },
};
