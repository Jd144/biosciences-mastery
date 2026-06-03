-- ============================================================
-- Biotechnology Exam + Profile + Notification System
-- ============================================================

CREATE TABLE IF NOT EXISTS public.exams (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT NOT NULL,
  official_link     TEXT NOT NULL,
  syllabus_link     TEXT,
  registration_link TEXT,
  admit_card_link   TEXT,
  result_link       TEXT,
  study_resources_link TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_timelines (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id      UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  event_type   TEXT NOT NULL CHECK (event_type IN ('registration_start', 'registration_end', 'admit_card_release', 'exam_date', 'result_date')),
  event_date   DATE NOT NULL,
  event_label  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exam_id, event_type)
);

CREATE TABLE IF NOT EXISTS public.exam_details (
  exam_id            UUID PRIMARY KEY REFERENCES public.exams(id) ON DELETE CASCADE,
  eligibility        TEXT,
  exam_pattern       TEXT,
  marking_scheme     TEXT,
  duration           TEXT,
  seats_approximate  TEXT,
  fellowship_details TEXT,
  stipend_details    TEXT,
  award_amount       TEXT,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name            TEXT,
  profile_picture_url  TEXT,
  bio                  TEXT,
  selected_exam_id     UUID REFERENCES public.exams(id) ON DELETE SET NULL,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_exams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id      UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id           UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  html_message      TEXT,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  email_status      TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}'::JSONB,
  notification_key  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notifications_unique_key
  ON public.user_notifications(user_id, notification_key)
  WHERE notification_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.exam_notification_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id        UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL,
  email          TEXT,
  status         TEXT NOT NULL,
  payload        JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exams" ON public.exams
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read exam timelines" ON public.exam_timelines
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read exam details" ON public.exam_details
  FOR SELECT USING (true);

CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own exams" ON public.user_exams
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exams" ON public.user_exams
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own notifications" ON public.user_notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.user_notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications" ON public.user_notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages exam notification logs" ON public.exam_notification_logs
  FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_exam_timelines_exam_id ON public.exam_timelines(exam_id);
CREATE INDEX IF NOT EXISTS idx_user_exams_user_id ON public.user_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id, created_at DESC);

INSERT INTO public.admin_allowlist(email)
VALUES ('jdbanna34@gmail.com')
ON CONFLICT DO NOTHING;

INSERT INTO public.exams (code, name, description, official_link, syllabus_link, registration_link, study_resources_link)
VALUES
  ('GATE_BT', 'GATE Biotechnology', 'Graduate Aptitude Test in Engineering - Biotechnology. National level entrance test for M.Tech/PhD admissions.', 'https://gate2026.iitr.ac.in/', 'https://gate2026.iitr.ac.in/syllabus.html', 'https://goaps.iitr.ac.in/', 'https://gate2026.iitr.ac.in/'),
  ('CSIR_NET_LS', 'CSIR NET Life Sciences', 'CSIR UGC NET - Life Sciences for Junior Research Fellowship and Lectureship eligibility.', 'https://csirnet.nta.ac.in/', 'https://csirnet.nta.ac.in/syllabus/', 'https://csirnet.nta.ac.in/', 'https://csirhrdg.res.in/'),
  ('DBT_JRF', 'DBT-JRF', 'Department of Biotechnology - Junior Research Fellowship for PhD in Biotechnology/Life Sciences.', 'https://dbtindia.gov.in/', 'https://rcb.res.in/DBTPG/', 'https://rcb.res.in/DBTPG/', 'https://dbtindia.gov.in/schemes-programmes/research-development'),
  ('ICMR_JRF', 'ICMR-JRF', 'Indian Council of Medical Research - Junior Research Fellowship for biomedical sciences research.', 'https://www.icmr.gov.in/', 'https://www.icmr.gov.in/exam.html', 'https://www.icmr.gov.in/', 'https://main.icmr.nic.in/content/fellowships'),
  ('ICAR_NET', 'ICAR NET', 'Indian Council of Agricultural Research - NET for agricultural sciences research fellowship and lectureship.', 'https://icar.nta.ac.in/', 'https://icar.nta.ac.in/information-bulletin/', 'https://icar.nta.ac.in/', 'https://www.icar.org.in/')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  official_link = EXCLUDED.official_link,
  syllabus_link = EXCLUDED.syllabus_link,
  registration_link = EXCLUDED.registration_link,
  study_resources_link = EXCLUDED.study_resources_link,
  updated_at = NOW();

INSERT INTO public.exam_details (exam_id, eligibility, exam_pattern, marking_scheme, duration, seats_approximate, fellowship_details, stipend_details, award_amount)
SELECT e.id,
  d.eligibility,
  d.exam_pattern,
  d.marking_scheme,
  d.duration,
  d.seats_approximate,
  d.fellowship_details,
  d.stipend_details,
  d.award_amount
FROM public.exams e
JOIN (
  VALUES
    ('GATE_BT', 'Bachelor degree holders in engineering/technology/science streams as per GATE notification.', 'Computer-based test. General Aptitude + Biotechnology sections.', '1-mark and 2-mark questions; negative marking applicable for MCQs.', '3 hours', 'Institutes dependent', NULL, NULL, NULL),
    ('CSIR_NET_LS', 'M.Sc./Integrated BS-MS/B.Tech/B.E/B.Pharma/MBBS or equivalent in Life Sciences related disciplines.', 'Single paper with Part A (General Aptitude), Part B and Part C (Life Sciences).', 'Mixed objective questions with partial negative marking.', '3 hours', 'JRF/LS category as notified', 'JRF and Lectureship eligibility.', 'As per CSIR/UGC norms', NULL),
    ('DBT_JRF', 'Master degree in Biotechnology/Life Sciences with required aggregate and category relaxations.', 'National Biotechnology Eligibility Test (objective format).', 'As per DBT BET information bulletin.', '3 hours', 'Category wise based on merit', 'DBT-Junior Research Fellowship for PhD.', 'As per DBT fellowship rules', 'Government fellowship rates apply'),
    ('ICMR_JRF', 'Postgraduate degree in basic professional courses with minimum marks as per ICMR notice.', 'Computer based objective test in biomedical sciences.', 'Negative marking and sectional distribution as notified.', '2 hours', 'Merit based shortlist', 'ICMR-JRF for biomedical PhD research.', 'As per ICMR fellowship norms', 'Government fellowship rates apply'),
    ('ICAR_NET', 'Master degree in relevant Agricultural disciplines from recognized universities.', 'Objective paper for Agricultural Research Services/NET eligibility.', 'As per ICAR NET notification.', '2 hours', 'Subject-wise merit based', 'Research and lectureship eligibility in agricultural sciences.', 'As per ICAR fellowship norms', NULL)
) AS d(code, eligibility, exam_pattern, marking_scheme, duration, seats_approximate, fellowship_details, stipend_details, award_amount)
ON d.code = e.code
ON CONFLICT (exam_id) DO UPDATE
SET
  eligibility = EXCLUDED.eligibility,
  exam_pattern = EXCLUDED.exam_pattern,
  marking_scheme = EXCLUDED.marking_scheme,
  duration = EXCLUDED.duration,
  seats_approximate = EXCLUDED.seats_approximate,
  fellowship_details = EXCLUDED.fellowship_details,
  stipend_details = EXCLUDED.stipend_details,
  award_amount = EXCLUDED.award_amount,
  updated_at = NOW();

INSERT INTO public.exam_timelines (exam_id, event_type, event_date, event_label)
SELECT e.id, t.event_type, t.event_date, t.event_label
FROM public.exams e
JOIN (
  VALUES
    ('GATE_BT', 'registration_start', DATE '2025-08-28', 'Registration Opens'),
    ('GATE_BT', 'registration_end', DATE '2025-10-03', 'Registration Closes'),
    ('GATE_BT', 'admit_card_release', DATE '2026-01-02', 'Admit Card Release'),
    ('GATE_BT', 'exam_date', DATE '2026-02-07', 'Exam Date'),
    ('GATE_BT', 'result_date', DATE '2026-03-19', 'Result Date'),

    ('CSIR_NET_LS', 'registration_start', DATE '2026-03-01', 'Application Start'),
    ('CSIR_NET_LS', 'registration_end', DATE '2026-03-30', 'Application Deadline'),
    ('CSIR_NET_LS', 'admit_card_release', DATE '2026-06-10', 'Admit Card Release'),
    ('CSIR_NET_LS', 'exam_date', DATE '2026-06-28', 'Exam Date'),
    ('CSIR_NET_LS', 'result_date', DATE '2026-08-20', 'Result Announcement'),

    ('DBT_JRF', 'registration_start', DATE '2026-02-15', 'Application Start'),
    ('DBT_JRF', 'registration_end', DATE '2026-03-17', 'Application Deadline'),
    ('DBT_JRF', 'admit_card_release', DATE '2026-05-08', 'Admit Card Release'),
    ('DBT_JRF', 'exam_date', DATE '2026-05-17', 'Exam Date'),
    ('DBT_JRF', 'result_date', DATE '2026-06-30', 'Result Announcement'),

    ('ICMR_JRF', 'registration_start', DATE '2026-04-01', 'Application Start'),
    ('ICMR_JRF', 'registration_end', DATE '2026-04-30', 'Application Deadline'),
    ('ICMR_JRF', 'admit_card_release', DATE '2026-06-20', 'Admit Card Release'),
    ('ICMR_JRF', 'exam_date', DATE '2026-07-12', 'Exam Date'),
    ('ICMR_JRF', 'result_date', DATE '2026-08-25', 'Result Announcement'),

    ('ICAR_NET', 'registration_start', DATE '2026-02-20', 'Registration Start'),
    ('ICAR_NET', 'registration_end', DATE '2026-03-20', 'Registration Deadline'),
    ('ICAR_NET', 'admit_card_release', DATE '2026-05-25', 'Admit Card Release'),
    ('ICAR_NET', 'exam_date', DATE '2026-06-15', 'Exam Date'),
    ('ICAR_NET', 'result_date', DATE '2026-07-30', 'Result Date')
) AS t(code, event_type, event_date, event_label)
ON t.code = e.code
ON CONFLICT (exam_id, event_type) DO UPDATE
SET
  event_date = EXCLUDED.event_date,
  event_label = EXCLUDED.event_label,
  updated_at = NOW();
