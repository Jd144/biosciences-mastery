-- coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code           TEXT NOT NULL UNIQUE,
  discount_type  TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'flat')),
  discount_value INT NOT NULL CHECK (discount_value > 0),
  usage_limit    INT,
  uses_count     INT NOT NULL DEFAULT 0,
  valid_from     TIMESTAMPTZ,
  valid_to       TIMESTAMPTZ,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.app_settings (key, value) VALUES
  ('free_ai_requests_per_day', '5'),
  ('free_quiz_questions', '10'),
  ('premium_quiz_questions', '50')
ON CONFLICT (key) DO NOTHING;

-- Add coupon fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_paise INT NOT NULL DEFAULT 0;

-- RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only write coupons" ON public.coupons FOR ALL USING (false);
CREATE POLICY "Authenticated can read active coupons" ON public.coupons FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Service role only write app_settings" ON public.app_settings FOR ALL USING (false);
CREATE POLICY "Authenticated can read app_settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
