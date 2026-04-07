-- ============================================================
-- Migration: Add AI usage log table for per-day rate limiting
-- Run in Supabase SQL Editor (safe to re-run — idempotent).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  request_count INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'ai_usage_logs'
      AND policyname = 'Users can read own ai_usage_logs'
  ) THEN
    CREATE POLICY "Users can read own ai_usage_logs"
      ON public.ai_usage_logs FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'ai_usage_logs'
      AND policyname = 'Users can upsert own ai_usage_logs'
  ) THEN
    CREATE POLICY "Users can upsert own ai_usage_logs"
      ON public.ai_usage_logs FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_date
  ON public.ai_usage_logs(user_id, usage_date);
