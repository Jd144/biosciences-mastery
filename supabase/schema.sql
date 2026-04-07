-- ============================================================
-- BioSciences Mastery — Supabase SQL Schema
-- Run this in your Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  description  TEXT,
  order_index  INT NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TOPICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id  UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subject_id, slug)
);

-- ============================================================
-- 3. TOPIC CONTENT (notes + flowchart)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topic_content (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id            UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  language            TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  short_notes_md      TEXT,
  detailed_notes_md   TEXT,
  flowchart_mermaid   TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (topic_id, language)
);

-- ============================================================
-- 4. TOPIC TABLES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topic_tables (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id    UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  title       TEXT NOT NULL,
  table_json  JSONB NOT NULL DEFAULT '{"headers":[],"rows":[]}'::JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. TOPIC DIAGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.topic_diagrams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id    UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  alt_text    TEXT,
  language    TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. PYQs (Previous Year Questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pyqs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id     UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  year         INT NOT NULL CHECK (year >= 2000 AND year <= 2100),
  question     TEXT NOT NULL,
  options      JSONB NOT NULL DEFAULT '{"A":"","B":"","C":"","D":""}'::JSONB,
  answer       TEXT NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  explanation  TEXT,
  paper_source TEXT,
  tags         TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. QUIZZES (10 per topic)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quizzes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id   UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  quiz_no    INT NOT NULL CHECK (quiz_no >= 1 AND quiz_no <= 10),
  title      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (topic_id, quiz_no)
);

-- ============================================================
-- 8. QUIZ QUESTIONS (30 per quiz)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id      UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_no  INT NOT NULL DEFAULT 1,
  question     TEXT NOT NULL,
  options      JSONB NOT NULL DEFAULT '{"A":"","B":"","C":"","D":""}'::JSONB,
  answer       TEXT NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
  explanation  TEXT,
  difficulty   TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type            TEXT NOT NULL CHECK (plan_type IN ('FULL', 'SINGLE_SUBJECT')),
  subject_id           UUID REFERENCES public.subjects(id),
  amount_paise         INT NOT NULL,
  razorpay_order_id    TEXT NOT NULL UNIQUE,
  razorpay_payment_id  TEXT,
  status               TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. ENTITLEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.entitlements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('FULL', 'SUBJECT')),
  subject_id    UUID REFERENCES public.subjects(id),
  activated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_full_per_user EXCLUDE (user_id WITH =) WHERE (type = 'FULL'),
  CONSTRAINT unique_subject_per_user UNIQUE (user_id, subject_id)
);

-- ============================================================
-- 11. AI NOTES CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_notes_cache (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id       UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  language       TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'hinglish')),
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  content_md     TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, topic_id, language, prompt_version)
);

-- ============================================================
-- 12. AI USAGE DAILY (tracks free-tier AI chat usage per user per day)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_usage_daily (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- ============================================================
-- 13. ADMIN ALLOWLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pyqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_notes_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- Public read for catalog
CREATE POLICY "Anyone can read subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can read topics" ON public.topics FOR SELECT USING (true);

-- Authenticated reads for content (access enforcement in API)
CREATE POLICY "Authenticated can read topic_content" ON public.topic_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read topic_tables" ON public.topic_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read topic_diagrams" ON public.topic_diagrams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read pyqs" ON public.pyqs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read quizzes" ON public.quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read quiz_questions" ON public.quiz_questions FOR SELECT TO authenticated USING (true);

-- Orders: users see only their own
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Entitlements: users see only their own
CREATE POLICY "Users can read own entitlements" ON public.entitlements FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- AI notes cache: users see only their own
CREATE POLICY "Users can read own ai_notes_cache" ON public.ai_notes_cache FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own ai_notes_cache" ON public.ai_notes_cache FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin allowlist: only service role
CREATE POLICY "Service role can manage admin_allowlist" ON public.admin_allowlist FOR ALL USING (false);

-- AI usage daily: service role manages counts; users can read own
CREATE POLICY "Users can read own ai_usage_daily" ON public.ai_usage_daily FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topic_content_topic_id ON public.topic_content(topic_id);
CREATE INDEX IF NOT EXISTS idx_pyqs_topic_id ON public.pyqs(topic_id);
CREATE INDEX IF NOT EXISTS idx_pyqs_year ON public.pyqs(year);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON public.quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_notes_cache_user_topic ON public.ai_notes_cache(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_user_date ON public.ai_usage_daily(user_id, date);
