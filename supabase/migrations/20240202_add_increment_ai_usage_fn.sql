-- ============================================================
-- Migration: Add atomic AI usage increment function
-- ============================================================

-- Atomically increments the daily AI usage count for a user.
-- If the new count would exceed p_limit the count is capped at p_limit
-- and the function returns allowed=false.
--
-- This runs as SECURITY DEFINER so it can write to ai_usage_log
-- on behalf of any authenticated user without requiring the
-- service-role key from the client caller.
CREATE OR REPLACE FUNCTION public.increment_ai_usage(
  p_user_id  UUID,
  p_endpoint TEXT,
  p_limit    INT
)
RETURNS TABLE(allowed BOOLEAN, used INT, daily_limit INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Upsert: insert a new row or increment the existing count atomically.
  INSERT INTO public.ai_usage_log (user_id, endpoint, date, count)
  VALUES (p_user_id, p_endpoint, CURRENT_DATE, 1)
  ON CONFLICT (user_id, endpoint, date)
  DO UPDATE SET count = ai_usage_log.count + 1
  RETURNING ai_usage_log.count INTO v_count;

  -- If the new count exceeds the limit, reset it to the limit and deny.
  IF v_count > p_limit THEN
    UPDATE public.ai_usage_log
    SET count = p_limit
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint
      AND date     = CURRENT_DATE;

    RETURN QUERY SELECT false, p_limit, p_limit;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_count, p_limit;
END;
$$;

-- Allow authenticated users to call this function.
-- The function itself enforces user_id equality, so one user cannot
-- increment another user's count.
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(UUID, TEXT, INT) TO authenticated;
