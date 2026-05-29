-- 20240409_add_plans_table.sql
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seed initial plans
INSERT INTO public.plans (name, price_inr, description)
  VALUES ('FULL', 999.00, 'Full course access')
  ON CONFLICT (name) DO NOTHING;
INSERT INTO public.plans (name, price_inr, description)
  VALUES ('SINGLE_SUBJECT', 449.00, 'Single subject access')
  ON CONFLICT (name) DO NOTHING;
