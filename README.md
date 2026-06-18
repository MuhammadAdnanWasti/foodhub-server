# FoodHub

A full-stack food ordering platform where customers browse restaurants, add meals to a cart, pay via Stripe Checkout, and track orders. Restaurants (providers) manage menus and fulfill orders; admins oversee users, categories, and provider applications.

---

Client LiveSite:  https://food-frontend-lime-sigma.vercel.app/ 

Backend Live : https://food-server-seven-bay.vercel.app/

## Project Description

FoodHub is a multi-role food delivery application built as a monorepo with two apps:

- **`food-server`** — REST API (Express + PostgreSQL + Prisma)
- **`food-frontend`** — Web app (Next.js App Router)

Customers discover restaurants, build a cart (single restaurant per order), checkout with Stripe, and receive order updates. Providers manage meals and orders. Admins manage the platform.

---

## Features

### Customer
- Browse restaurants and menus
- Shopping cart (single-restaurant rule enforced)
- Stripe Checkout payment flow
- Order tracking with status timeline (`PENDING_PAYMENT` → `PLACED` → `PREPARING` → `READY` → `DELIVERED`)
- Order cancellation (for unpaid/pending orders)
- Meal reviews
- Apply to become a provider
- Payment success/cancel return pages

### Provider (Restaurant)
- Provider profile management
- Meal CRUD (create, read, update, delete)
- View and manage incoming orders
- Order status updates

### Admin
- User management
- Provider application approval
- Category management
- Platform-wide order overview

### Platform & Security
- JWT authentication with role-based access (`CUSTOMER`, `PROVIDER`, `ADMIN`)
- Zod request validation on the backend
- Stripe webhook handling for payment confirmation
- Idempotent webhook processing
- Cart cleared automatically after successful payment

---

## Technologies Used

### Backend (`food-server`)

| Category | Technology |
|----------|------------|
| Runtime | Node.js |
| Framework | Express.js 5 |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | JWT, bcrypt |
| Payments | Stripe |
| Validation | Zod |
| Deployment | Vercel |

### Frontend (`food-frontend`)

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Components | shadcn/ui, Radix UI |
| Forms | React Hook Form, Zod |
| Icons | Lucide React |
| Notifications | Sonner |
| Auth | JWT (cookie-based server actions) |

---

## Project Structure

```
FoodHub/
├── food-server/          # Express API
│   ├── prisma/           # Database schema & migrations
│   └── src/
│       ├── modules/      # Auth, Cart, Order, Payment, Meal, Provider, Admin, Review
│       ├── config/       # Env & Stripe config
│       └── app.ts        # Express app + webhook routes
│
└── food-frontend/        # Next.js app
    └── src/
        ├── app/          # Routes (public + role-based dashboard)
        ├── components/   # UI components
        ├── services/     # Server actions (API calls)
        └── types/        # Shared TypeScript types
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database (e.g. Neon, local Postgres)
- [Stripe](https://stripe.com) account (test mode for development)
- npm or yarn

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd FoodHub
```

---

### 2. Backend setup (`food-server`)

```bash
cd food-server
npm install
```

Create `food-server/.env`:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

API runs at `http://localhost:5000`

---

### 3. Frontend setup (`food-frontend`)

```bash
cd food-frontend
npm install
```

Create `food-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

### 4. Stripe webhook (local development)

Stripe cannot reach `localhost` directly. Use Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/webhook
```

Copy the webhook signing secret (`whsec_...`) from the CLI output into `STRIPE_WEBHOOK_SECRET` in `food-server/.env`.

For production, configure the webhook in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks):

```
https://your-backend-url.vercel.app/api/webhook
```

Listen for: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`

---

### 5. Production deployment (Vercel)

#### Backend (`food-server`)

Set these environment variables in Vercel:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random secret string |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from Stripe Dashboard webhook |
| `STRIPE_SUCCESS_URL` | `https://your-frontend.vercel.app/payment/success` |
| `STRIPE_CANCEL_URL` | `https://your-frontend.vercel.app/payment/cancel` |

Important:
- Webhook URL: `https://your-backend.vercel.app/api/webhook`
- Success/cancel URLs must point to the **frontend**, not the backend

#### Frontend (`food-frontend`)

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` |

Update backend CORS in `food-server/src/app.ts` to include your production frontend URL.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/cart` | Cart operations |
| POST | `/api/orders/checkout-from-cart` | Create Stripe Checkout Session |
| GET | `/api/orders` | Customer orders |
| PATCH | `/api/orders/:id/cancel` | Cancel order |
| POST | `/api/webhook` | Stripe webhook (production) |
| POST | `/webhook` | Stripe webhook (local dev) |

---

## Payment Flow

1. Customer adds items to cart → `/dashboard/cart`
2. Enters delivery address → clicks **Proceed to Payment**
3. Backend creates order (`PENDING_PAYMENT`) + Stripe Checkout Session
4. Customer is redirected to Stripe-hosted checkout
5. On success, Stripe sends webhook → order becomes `PLACED`, cart is cleared
6. Customer returns to `/payment/success` on the frontend

---

## Scripts

### Backend

```bash
npm run dev      # Development server
npm run build    # Compile TypeScript
npm start        # Run production build
```

### Frontend

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Run production server
```

---

## License

ISC
