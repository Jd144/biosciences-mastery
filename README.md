# BioSciences Mastery — GAT-B Prep Platform

India's GAT-B (Graduate Aptitude Test in Biotechnology) preparation platform built with Next.js, Supabase, and OpenAI.

## Features

- **10 GAT-B Subjects** with complete topic hierarchy
- **Authentication**: Email + Password with Sign Up / Sign In / Forgot Password; Phone OTP + Email OTP as alternatives
- **Free vs Premium**: Free users get limited access; premium users get unlimited access
- **Payments**: Razorpay integration — Full Course (₹999) or Single Subject (₹449)
- **Content**: Notes (short/detailed), Flowcharts (Mermaid), Tables, Diagrams
- **PYQs**: Official previous year questions, topic-tagged
- **Quizzes**: 10 quizzes × 30 questions per topic
- **AI Features** (OpenAI GPT-4o-mini):
  - AI Doubt Solver Chat (topic/subject context)
  - AI Notes Generator (click-to-generate, cached per user/topic/language)
- **Coupon System**: Admin-managed discount coupons (percent or flat)
- **Admin Panel**: Manage subjects, topics, content, PYQs, quizzes, users, orders, coupons, analytics

---

## Free vs Premium

| Feature | Free | Premium |
|---------|------|---------|
| Quiz questions | 10 per topic | 50 per topic |
| AI requests | 5 per day | Unlimited |
| Notes tabs | Overview + Quizzes + AI | All (short, detailed, flowcharts, tables, diagrams, PYQs) |
| Content access | Preview only | Full |

**Upgrade options:**
- **Full Course** — ₹999, lifetime access to all 10 subjects
- **Single Subject** — ₹449, lifetime access to one subject

---

## Access Flow

1. User registers/logs in with email + password
2. Free tier: limited access (10 quiz questions/topic, 5 AI requests/day, overview only)
3. Premium: purchase Full Course or individual subject via Razorpay
4. After payment confirmation (webhook), entitlement is created and full access is granted
5. Coupons can be applied at checkout for discounts
6. Admin account (`jdbanna34@gmail.com`) gets direct admin panel access

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Email+Password & OTP) |
| Database | Supabase Postgres |
| Payments | Razorpay |
| AI | OpenAI GPT-4o-mini |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/Jd144/biosciences-mastery.git
cd biosciences-mastery
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...

# Admin
ADMIN_EMAIL=jdbanna34@gmail.com

# Optional: override free/premium limits
FREE_AI_REQUESTS_PER_DAY=5
FREE_QUIZ_QUESTIONS=10
PREMIUM_QUIZ_QUESTIONS=50
```

### 3. Database Setup

Run all migrations in `supabase/migrations/` in order, or apply `supabase/schema.sql` to a fresh project.

```bash
supabase db push
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Admin Access

Login with the email set in `ADMIN_EMAIL` (default: `jdbanna34@gmail.com`). You will be redirected directly to `/admin`.

For other admin accounts, add the user's UUID and email to `public.admin_allowlist`.

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin panel (subjects, topics, content, PYQs, quizzes, users, orders, coupons, analytics)
│   ├── api/            # API routes
│   │   ├── ai/         # AI chat + notes
│   │   ├── payments/   # Razorpay order creation + webhook
│   │   ├── coupons/    # Coupon validation
│   │   ├── entitlements/
│   │   ├── quiz/
│   │   └── admin/      # Admin CRUD APIs
│   ├── app/            # Authenticated user area
│   │   ├── dashboard/
│   │   ├── subjects/
│   │   ├── buy/        # Purchase pages (full / single subject)
│   │   └── ...
│   ├── login/
│   └── page.tsx        # Landing page
├── components/
├── lib/
│   ├── admin.ts        # RBAC helpers
│   ├── ai-limits.ts    # AI rate limiting
│   ├── supabase/       # Supabase client helpers + middleware
│   └── utils.ts        # PRICES constants + helpers
├── types/
supabase/
├── schema.sql          # Full DB schema
├── seed.sql            # Seed data
└── migrations/
```

---

## Razorpay Webhook Setup

1. In Razorpay dashboard → Webhooks → Add new webhook
2. URL: `https://your-domain.vercel.app/api/payments/webhook`
3. Events: `payment.captured`
4. Set webhook secret and add to `RAZORPAY_WEBHOOK_SECRET` env var

---

## Admin Panel

Access at `/admin` (admin login required).

| Section | Description |
|---------|-------------|
| Overview | Stats dashboard |
| Subjects | Add/edit/delete subjects |
| Topics | Add/edit/delete topics per subject |
| Content | Add/edit notes, flowcharts per topic |
| PYQs | Add/edit previous year questions |
| Quizzes | Add/edit quiz questions |
| Users | View users, ban/unban |
| Orders | View all orders and revenue |
| Coupons | Create/manage discount coupons |
| Analytics | Usage statistics |
| Settings | Site configuration |
