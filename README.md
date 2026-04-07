# BioSciences Mastery — GAT-B Prep Platform

India's production-ready GAT-B (Graduate Aptitude Test in Biotechnology) preparation platform built with Next.js, Supabase, Razorpay, and OpenAI.

## Features

- **10 GAT-B Subjects** with complete topic hierarchy
- **Authentication**: Email + Password (default) with Sign Up / Sign In / Forgot Password; Phone OTP + Email OTP as alternatives
- **Payments**: Razorpay (India-only, INR)
  - Full Course: ₹999 (lifetime, all 10 subjects)
  - Single Subject: ₹449 (lifetime, per subject)
- **Content**: Notes (short/detailed), Flowcharts (Mermaid), Tables, Diagrams
- **PYQs**: Official previous year questions, topic-tagged
- **Quizzes**: 10 quizzes × 30 questions per topic
- **AI Features** (OpenAI GPT-4o-mini):
  - AI Doubt Solver Chat (topic/subject context) — Free: 5 req/day · Premium: unlimited
  - AI Notes Generator (click-to-generate, cached per user/topic/language) — Free: 5 req/day · Premium: unlimited
- **Quiz Limits**: Free: 10 questions per topic · Premium (Full Course): 50 questions per topic
- **Admin Panel**: Manage subjects, topics, content, PYQs, quizzes, users, orders

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 16 (App Router, TypeScript) |
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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Used as base for password-reset redirect URL
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` is used server-side only and is never exposed to the browser. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and other `NEXT_PUBLIC_*` variables) are sent to the client.

### 3. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate subjects and topics
4. Add yourself as admin:
   ```sql
   INSERT INTO public.admin_allowlist (user_id, email)
   VALUES ('your-supabase-user-uuid', 'your@email.com');
   ```

### 4. Supabase Auth Configuration

#### Enable Email + Password sign-ins
1. Supabase Dashboard → **Authentication → Providers → Email**
2. Ensure **Email provider** is **enabled**
3. (Optional) Keep "Confirm email" ON so new users verify their address

#### Password Reset — Redirect URLs
The "Forgot Password" flow sends a reset link to the user's email. The link redirects to `/auth/reset` in your app. You must whitelist this URL in Supabase:

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to your production domain (e.g. `https://your-domain.com`)
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/reset` (local dev)
   - `https://your-domain.com/auth/reset` (production)
4. Save

> **Important:** `NEXT_PUBLIC_APP_URL` in `.env.local` must match the domain you add above so that `resetPasswordForEmail` generates the correct redirect URL.

### 5. Razorpay Webhook

1. Dashboard > Settings > Webhooks
2. Add URL: `https://your-domain.com/api/payments/webhook`
3. Select event: `payment.captured`
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### 6. Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
src/
├── proxy.ts                            # Route protection (Next.js 16 Proxy)
├── app/
│   ├── page.tsx                        # Landing page
│   ├── login/page.tsx                  # Email+Password login (default) + OTP (alternative)
│   ├── auth/reset/page.tsx             # Password reset (handles Supabase reset link)
│   ├── app/
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── subjects/
│   │   │   ├── page.tsx                # Subjects list
│   │   │   └── [subjectSlug]/
│   │   │       ├── page.tsx            # Subject topics
│   │   │       └── topics/[topicSlug]/ # Topic page
│   │   └── buy/
│   │       ├── full/page.tsx           # Buy ₹999
│   │       └── subject/page.tsx        # Buy ₹449
│   ├── admin/                          # Admin panel
│   └── api/
│       ├── payments/create-order/      # Razorpay order creation
│       ├── payments/webhook/           # Razorpay webhook (entitlement unlock)
│       ├── entitlements/               # User entitlements check
│       ├── ai/notes/                   # AI notes generator
│       ├── ai/chat/                    # AI doubt solver
│       └── admin/                      # Admin CRUD APIs

supabase/
├── schema.sql                          # DB schema + RLS policies
├── seed.sql                            # 10 subjects + all topics
└── migrations/
    ├── 20240101_fix_rls_policies.sql   # Idempotent RLS policy fixes
    └── 20240102_add_ai_usage_log.sql   # AI usage tracking table (rate limiting)
```

---

## Free vs Premium Limits

| Feature | Free (Single Subject purchase) | Premium (Full Course purchase) |
|---------|-------------------------------|-------------------------------|
| AI Doubt Chat | **5 requests/day** (resets at midnight UTC) | **Unlimited** |
| AI Notes Generator | **5 requests/day** (cached responses don't count) | **Unlimited** |
| Quiz Questions | **10 questions per topic** | **50 questions per topic** |
| Content (Notes, PYQs, Diagrams) | Full access | Full access |

### Enforcement Details

- **Server-side**: Rate limits are enforced in `/api/ai/chat` and `/api/ai/notes` API routes. Free users exceeding the 5/day AI limit receive HTTP 429.
- **Quiz limits**: Applied in the topic page server component before sending data to the client. Premium users (FULL entitlement) see 50 questions; SUBJECT-only users see 10.
- **UI**: Free users see a live "N requests remaining today" banner in the AI Notes and Doubt Chat tabs. Premium users see an "Unlimited" badge.
- **Cache**: Loading previously cached AI notes does **not** count against the daily limit.

### Database

The `ai_usage_log` table tracks daily AI requests per user:
- Run `supabase/migrations/20240102_add_ai_usage_log.sql` after the base schema.

---



| Entitlement | Access |
|-------------|--------|
| `FULL` | All 10 subjects |
| `SUBJECT(id)` | Only that subject |
| None | Locked (buy prompt shown) |

Entitlements are ONLY created via Razorpay webhook server-side verification.

---

## Route Protection

All `/app/*` and `/admin/*` routes are protected by the `src/proxy.ts` file (Next.js 16 Proxy — successor to Middleware). Unauthenticated requests are automatically redirected to `/login`.

> **Note:** In Next.js 16 the `middleware.ts` file convention is deprecated. This project uses `src/proxy.ts` with a named `proxy` export. Do not rename it back to `middleware.ts`.

---

## Payment Flow

```
User clicks Buy
  → POST /api/payments/create-order (validates, creates Razorpay order, saves to DB)
    → Razorpay Checkout modal
      → User pays
        → Razorpay webhook
          → POST /api/payments/webhook (verifies HMAC signature)
            → Creates entitlement in DB
              → User can access content
```

---

## Troubleshooting

### `/app/dashboard` returns 500
- **Cause**: Most commonly, Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are not set in Vercel.
- **Fix**: Go to Vercel → Project → Settings → Environment Variables and add the required vars, then redeploy.

### Auth not working / always redirected to login
- **Cause**: Proxy (`src/proxy.ts`) not running, or cookies not propagating.
- **Check**: Ensure `src/proxy.ts` exists (not `src/middleware.ts`) and exports a `proxy` function.

### RLS errors in Supabase logs
- Run `supabase/migrations/20240101_fix_rls_policies.sql` in the Supabase SQL Editor to ensure correct policies.
- Run `supabase/migrations/20240102_add_ai_usage_log.sql` to create the AI rate-limit tracking table.
- Users must be authenticated to read `topic_content`, `topic_tables`, `topic_diagrams`, `quizzes`, and `quiz_questions`.
- Only the authenticated user can read their own `entitlements`, `orders`, and `ai_notes_cache`.
- `admin_allowlist` is service-role-only — never expose via client queries.

### Build fails with "Middleware is missing expected function export"
- **Cause**: Old `src/middleware.ts` without a function export exists.
- **Fix**: Ensure `src/middleware.ts` does not exist. Use `src/proxy.ts` instead.

