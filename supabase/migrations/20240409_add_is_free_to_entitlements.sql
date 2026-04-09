-- 20240409_add_is_free_to_entitlements.sql
ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
