# BioSciences Mastery — GAT-B Prep Platform

India's GAT-B (Graduate Aptitude Test in Biotechnology) preparation platform built with Next.js, Supabase, and OpenAI.

## Features

- **10 GAT-B Subjects** with complete topic hierarchy
- **Authentication**: Email + Password with Sign Up / Sign In / Forgot Password; Phone OTP + Email OTP as alternatives
- **Access Code System**: One-time access code per user (admin-generated, email-assigned) for lifetime platform access
- **Content**: Notes (short/detailed), Flowcharts (Mermaid), Tables, Diagrams
- **PYQs**: Official previous year questions, topic-tagged
- **Quizzes**: 10 quizzes × 30 questions per topic
- **AI Features** (OpenAI GPT-4o-mini):
  - AI Doubt Solver Chat (topic/subject context)
  - AI Notes Generator (click-to-generate, cached per user/topic/language)
- **Admin Panel**: Manage subjects, topics, content, PYQs, quizzes, users, access codes

---

## Access Flow

1. User registers/logs in with email + password
2. After first login, user is prompted to enter a **one-time access code**
3. Admin generates the code in the admin panel and assigns it to the user's email
4. Once the code is entered correctly, the user gets **lifetime full access** — no code needed again
5. Admin account (`jdbanna34@gmail.com`) bypasses the code requirement and goes directly to the admin panel

> **No payments required.** All content is completely free after code verification.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (Email+Password & OTP) |
| Database | Supabase Postgres |
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
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin email (gets admin panel access without a code)
ADMIN_EMAIL=jdbanna34@gmail.com
```

> **Note**: Razorpay keys are no longer required. The payment system has been removed.

### 3. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Run the migration: `supabase/migrations/20260407_access_codes.sql`
4. Run `supabase/seed.sql` to populate subjects and topics
5. Add yourself as admin (optional — or use the ADMIN_EMAIL env var):
   ```sql
   INSERT INTO public.admin_allowlist (user_id, email)
   VALUES ('your-supabase-user-uuid', 'your@email.com');
   ```

### 4. Admin Setup

The admin account is automatically set via the `ADMIN_EMAIL` environment variable (default: `jdbanna34@gmail.com`).

When logging in with the admin email:
- You are redirected directly to `/admin` (no access code required)
- You can generate access codes for students in **Admin → Access Codes**

### 5. Generating Access Codes

1. Log in with your admin email
2. Go to **Admin Panel → Access Codes**
3. Enter the student's email address and click **Generate Code**
4. Share the generated code with the student (format: `XXXX-XXXX-XXXX`)
5. The student enters the code once on the `/app/verify-code` page
6. After verification, the student has lifetime access

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
│   ├── auth/reset/page.tsx             # Password reset
│   ├── app/
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── verify-code/page.tsx        # One-time access code entry
│   │   ├── subjects/                   # Subject catalog
│   │   └── subjects/[slug]/topics/     # Topic pages (full access)
│   ├── admin/                          # Admin panel
│   │   └── access-codes/              # Access code management
│   └── api/
│       ├── access-codes/verify/        # Code verification API
│       ├── ai/notes/                   # AI notes generator
│       ├── ai/chat/                    # AI doubt solver
│       └── admin/                      # Admin CRUD APIs

supabase/
├── schema.sql                          # DB schema + RLS policies
├── seed.sql                            # 10 subjects + all topics
└── migrations/
    ├── 20240101_fix_rls_policies.sql
    └── 20260407_access_codes.sql       # Access code tables
```

---

## Route Protection

| Route | Access |
|-------|--------|
| `/login` | Public |
| `/app/verify-code` | Authenticated (no code needed) |
| `/app/*` | Authenticated + code verified (or admin) |
| `/admin/*` | Admin only |

---

## Troubleshooting

### User stuck on verify-code page
- Check that you've generated a code for the user's exact email in Admin → Access Codes
- The code is case-insensitive; the email must match exactly

### Admin panel not accessible
- Ensure `ADMIN_EMAIL` env var matches the login email exactly
- Or insert the user into `admin_allowlist` via Supabase SQL Editor

### Build fails with "Middleware is missing expected function export"
- Ensure `src/middleware.ts` does not exist. Use `src/proxy.ts` instead.
