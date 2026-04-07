-- ============================================================
-- Migration: Add AI Usage Log table for rate limiting
-- Free tier: 5 AI requests per day
-- Premium (FULL entitlement): unlimited
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('chat', 'notes')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ai_usage_log"
  ON public.ai_usage_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_usage_log"
  ON public.ai_usage_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_date
  ON public.ai_usage_log (user_id, created_at);
