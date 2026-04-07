-- Migration: Add ai_usage_daily table for free-tier AI chat rate limiting
-- Free users: 5 AI chat messages/day. Premium users: unlimited.

CREATE TABLE IF NOT EXISTS public.ai_usage_daily (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE public.ai_usage_daily ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage (e.g. for display in UI)
CREATE POLICY "Users can read own ai_usage_daily"
  ON public.ai_usage_daily
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- The service role (used by the API) manages inserts/updates
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_user_date
  ON public.ai_usage_daily(user_id, date);
