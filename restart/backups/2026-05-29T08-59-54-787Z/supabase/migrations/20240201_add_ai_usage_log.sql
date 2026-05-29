-- ============================================================
-- Migration: Add AI usage log table for rate limiting
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL CHECK (endpoint IN ('chat', 'notes')),
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INT NOT NULL DEFAULT 1,
  UNIQUE (user_id, endpoint, date)
);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own usage rows
CREATE POLICY "Users can manage own ai_usage_log"
  ON public.ai_usage_log
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_user_date
  ON public.ai_usage_log(user_id, date);
