-- 20240409_add_announcements_table.sql
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  popup_duration INT NOT NULL DEFAULT 10, -- seconds
  is_active BOOLEAN NOT NULL DEFAULT true,
  page_filter TEXT, -- e.g. '/app/gatb' or NULL for all
  user_filter TEXT, -- e.g. user_id or role, NULL for all
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
