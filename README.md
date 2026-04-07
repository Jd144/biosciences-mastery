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
  - AI Doubt Solver Chat (topic/subject context)
  - AI Notes Generator (click-to-generate, cached per user/topic/language)
- **Admin Panel**: Manage subjects, topics, content, PYQs, quizzes, users, orders
- **Free tier**: Topic overview, limited quizzes, and limited AI access without a paid plan

---

## Free vs Premium Access

| Feature | Free (Authenticated, No Plan) | Premium (Paid Plan) |
|---------|-------------------------------|---------------------|
| Topic overview (short notes) | ✅ Yes | ✅ Yes |
| Full notes (detailed, flowchart, tables, diagrams) | ❌ Locked | ✅ Yes |
| PYQs | ❌ Locked | ✅ Yes |
| Quizzes | ✅ 10 questions / topic (quiz 1) | ✅ Up to 50 questions / topic |
| AI Doubt Chat | ✅ Up to 5 requests/day | ✅ Unlimited |
| AI Notes Generator | ✅ Up to 5 requests/day | ✅ Unlimited |

> **Unauthenticated** visitors can browse individual topic pages and see the free overview, but must sign in to use AI features and quizzes.

### Configurable Limits

The following environment variables control free/premium limits (with defaults shown):

| Variable | Default | Description |
|----------|---------|-------------|
| `FREE_AI_REQUESTS_PER_DAY` | `5` | Max AI requests per day for free users |
| `FREE_QUIZ_QUESTIONS` | `10` | Max quiz questions per topic for free users |
| `PREMIUM_QUIZ_QUESTIONS` | `50` | Max quiz questions per topic for premium users |

Add these to your `.env.local` to override the defaults.

> **Note**: Premium users have **unlimited** AI access. The `PREMIUM_AI_REQUESTS_PER_DAY` variable is retained for legacy compatibility but has no effect on premium users.

### Rate Limiting Implementation

AI rate limits are tracked in the `ai_usage_log` Supabase table (one row per `user_id × endpoint × date`). The service-role client increments the counter atomically on each request. When a free user exceeds their daily limit the API returns HTTP 429 with a clear error message and an upgrade CTA. Premium users bypass rate limiting entirely. Cached AI notes do **not** count against the daily limit.

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

# Free vs premium limits (optional — defaults shown)
FREE_AI_REQUESTS_PER_DAY=5
FREE_QUIZ_QUESTIONS=10
PREMIUM_QUIZ_QUESTIONS=50
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` is used server-side only and is never exposed to the browser. Only `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and other `NEXT_PUBLIC_*` variables) are sent to the client.

### 3. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Apply the migration: run `supabase/migrations/20240201_add_ai_usage_log.sql`
4. Then run `supabase/seed.sql` to populate subjects and topics
5. Add yourself as admin:
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
    └── 20240101_fix_rls_policies.sql   # Idempotent RLS policy fixes
```

---

## Access Control

| Entitlement | Access |
|-------------|--------|
| `FULL` | All 10 subjects (full content, unlimited AI, premium quiz limits) |
| `SUBJECT(id)` | Only that subject (full content, unlimited AI, premium quiz limits) |
| None (free, authenticated) | Topic overview, 10-question quiz per topic, 5 AI requests/day |
| Unauthenticated | Topic overview only (no AI, no quiz) |

Entitlements are ONLY created via Razorpay webhook server-side verification.

### API Routes (Quiz)

`GET /api/quiz?topicId=<uuid>` — returns questions for a topic based on the caller's
entitlement tier. Free users receive up to `FREE_QUIZ_QUESTIONS` questions; premium
users receive up to `PREMIUM_QUIZ_QUESTIONS` questions. Requires authentication.

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
- Users must be authenticated to read `topic_content`, `topic_tables`, `topic_diagrams`, `quizzes`, and `quiz_questions`.
- Only the authenticated user can read their own `entitlements`, `orders`, and `ai_notes_cache`.
- `admin_allowlist` is service-role-only — never expose via client queries.

### Build fails with "Middleware is missing expected function export"
- **Cause**: Old `src/middleware.ts` without a function export exists.
- **Fix**: Ensure `src/middleware.ts` does not exist. Use `src/proxy.ts` instead.

