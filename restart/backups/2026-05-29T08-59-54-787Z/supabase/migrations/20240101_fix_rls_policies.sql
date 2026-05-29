-- ============================================================
-- Migration: Ensure correct RLS policies for login-gated app
-- Run this in the Supabase SQL Editor if you have an existing
-- database where the old policies may already exist.
-- ============================================================

-- Drop any old permissive public-read policies that may have
-- been created during initial setup (safe to re-run).

DO $$
BEGIN
  -- topic_content
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_content'
      AND policyname = 'Public can read topic_content'
  ) THEN
    DROP POLICY "Public can read topic_content" ON public.topic_content;
  END IF;

  -- topic_tables
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_tables'
      AND policyname = 'Public can read topic_tables'
  ) THEN
    DROP POLICY "Public can read topic_tables" ON public.topic_tables;
  END IF;

  -- topic_diagrams
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_diagrams'
      AND policyname = 'Public can read topic_diagrams'
  ) THEN
    DROP POLICY "Public can read topic_diagrams" ON public.topic_diagrams;
  END IF;
END $$;

-- ============================================================
-- Ensure correct authenticated-only read policies exist
-- (idempotent: uses IF NOT EXISTS equivalent)
-- ============================================================

-- topic_content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_content'
      AND policyname = 'Authenticated can read topic_content'
  ) THEN
    CREATE POLICY "Authenticated can read topic_content"
      ON public.topic_content FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- topic_tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_tables'
      AND policyname = 'Authenticated can read topic_tables'
  ) THEN
    CREATE POLICY "Authenticated can read topic_tables"
      ON public.topic_tables FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- topic_diagrams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'topic_diagrams'
      AND policyname = 'Authenticated can read topic_diagrams'
  ) THEN
    CREATE POLICY "Authenticated can read topic_diagrams"
      ON public.topic_diagrams FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- pyqs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'pyqs'
      AND policyname = 'Authenticated can read pyqs'
  ) THEN
    CREATE POLICY "Authenticated can read pyqs"
      ON public.pyqs FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- quizzes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quizzes'
      AND policyname = 'Authenticated can read quizzes'
  ) THEN
    CREATE POLICY "Authenticated can read quizzes"
      ON public.quizzes FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- quiz_questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'quiz_questions'
      AND policyname = 'Authenticated can read quiz_questions'
  ) THEN
    CREATE POLICY "Authenticated can read quiz_questions"
      ON public.quiz_questions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- ============================================================
-- Ensure internal tables have NO public or authenticated read
-- ============================================================

-- entitlements: users can only read their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'entitlements'
      AND policyname = 'Users can read own entitlements'
  ) THEN
    CREATE POLICY "Users can read own entitlements"
      ON public.entitlements FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- orders: users can only read their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'Users can read own orders'
  ) THEN
    CREATE POLICY "Users can read own orders"
      ON public.orders FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ai_notes_cache: users can only access their own rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ai_notes_cache'
      AND policyname = 'Users can read own ai_notes_cache'
  ) THEN
    CREATE POLICY "Users can read own ai_notes_cache"
      ON public.ai_notes_cache FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- admin_allowlist: no public or authenticated read; service role only
DO $$
BEGIN
  -- Remove any accidentally created public/authenticated policies
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_allowlist'
      AND policyname != 'Service role can manage admin_allowlist'
  ) THEN
    -- Drop all policies on admin_allowlist (except the service-role one)
    FOR r IN (
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'admin_allowlist'
        AND policyname != 'Service role can manage admin_allowlist'
    ) LOOP
      EXECUTE format('DROP POLICY %I ON public.admin_allowlist', r.policyname);
    END LOOP;
  END IF;
END $$;
