-- 20240409_add_subject_price_inr.sql
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS price_inr NUMERIC(10,2) DEFAULT 0;
