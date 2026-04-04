# BioSciences Mastery — GAT-B Prep Platform

India's production-ready GAT-B (Graduate Aptitude Test in Biotechnology) preparation platform built with Next.js, Supabase, Razorpay, and OpenAI.

## Features

- **10 GAT-B Subjects** with complete topic hierarchy
- **Authentication**: Phone OTP + Email OTP via Supabase
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

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (OTP) |
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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate subjects and topics
4. Add yourself as admin:
   ```sql
   INSERT INTO public.admin_allowlist (user_id, email)
   VALUES ('your-supabase-user-uuid', 'your@email.com');
   ```

### 4. Razorpay Webhook

1. Dashboard > Settings > Webhooks
2. Add URL: `https://your-domain.com/api/payments/webhook`
3. Select event: `payment.captured`
4. Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### 5. Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── login/page.tsx                  # OTP login
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
└── seed.sql                            # 10 subjects + all topics
```

---

## Access Control

| Entitlement | Access |
|-------------|--------|
| `FULL` | All 10 subjects |
| `SUBJECT(id)` | Only that subject |
| None | Locked (buy prompt shown) |

Entitlements are ONLY created via Razorpay webhook server-side verification.

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
