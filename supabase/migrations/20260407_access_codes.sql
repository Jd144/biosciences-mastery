-- Access Codes
CREATE TABLE IF NOT EXISTS public.access_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  assigned_email  TEXT NOT NULL,
  used_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at         TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tracks users who have verified their access code (lifetime access)
CREATE TABLE IF NOT EXISTS public.user_code_access (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_code_id  UUID NOT NULL REFERENCES public.access_codes(id),
  verified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Brute-force tracking
CREATE TABLE IF NOT EXISTS public.code_verification_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  success      BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_code_attempts_user_time ON public.code_verification_attempts(user_id, attempted_at);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_code_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_verification_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage access_codes
CREATE POLICY "Service role manages access_codes" ON public.access_codes FOR ALL USING (false);
-- Users can read their own verification record
CREATE POLICY "Users can read own user_code_access" ON public.user_code_access FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Service role manages verifications and attempts
CREATE POLICY "Service role manages user_code_access" ON public.user_code_access FOR ALL USING (false);
CREATE POLICY "Service role manages code_attempts" ON public.code_verification_attempts FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_access_codes_email ON public.access_codes(assigned_email);
CREATE INDEX IF NOT EXISTS idx_user_code_access_user ON public.user_code_access(user_id);
