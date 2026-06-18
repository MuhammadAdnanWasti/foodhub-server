import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import router from './routes';
import { notFound } from './middlewares/notFound';
import { PaymentController } from './modules/Payment/payment.controller';

const app: Application = express();

// Stripe webhook must use raw body — register BEFORE express.json()
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent
);

app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// application routes
app.use('/', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Apollo Gears World!');
});

app.use(notFound);
export default app;
