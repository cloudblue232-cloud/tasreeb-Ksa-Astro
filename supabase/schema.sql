-- ============================================================
-- كشف التسربات والعزل بالسعودية — Supabase Schema v3
-- ============================================================
-- Fresh-install script. Run once in Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → paste → Run
--
-- For existing projects that already have v1/v2 tables,
-- use supabase/migration_v3.sql instead.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. SHARED TRIGGER FUNCTION — auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. ADMINS TABLE
-- ============================================================
-- Controls who can write to any table via RLS.
-- After running this schema, create your user in Supabase Auth,
-- then insert their UID:
--
--   INSERT INTO admins (user_id)
--   VALUES ('your-auth-user-uuid-here');
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  user_id    UUID        PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin can read their own row (used by admin layout auth guard)
CREATE POLICY "admins_select_own"
  ON admins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. ARTICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  content          TEXT        NOT NULL,
  image_url        TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  published        BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- ============================================================
-- 4. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  description      TEXT        NOT NULL,
  meta_description TEXT,
  image_url        TEXT,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  published        BOOLEAN     NOT NULL DEFAULT true,
  -- JSON array of FAQ objects: [{q: string, a: string}, ...]
  -- Managed by the admin ServiceForm FAQ editor.
  faqs             JSONB       NOT NULL DEFAULT '[]'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_services_slug      ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(published);
CREATE INDEX IF NOT EXISTS idx_services_sort      ON services(sort_order);

-- ============================================================
-- 5. SITE SETTINGS TABLE
-- ============================================================
-- Key-value store for site-wide config managed via the admin
-- Settings page. Keys: site_title, site_description, phone,
-- whatsapp, google_ads_id.
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT        NOT NULL UNIQUE,
  value      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE articles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. ARTICLES POLICIES
-- ============================================================

-- Public (anon + authenticated) read published articles.
-- Admins can read all rows including drafts.
CREATE POLICY "articles_public_read"
  ON articles FOR SELECT TO anon, authenticated
  USING (
    published = true
    OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "articles_admin_insert"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "articles_admin_update"
  ON articles FOR UPDATE TO authenticated
  USING    (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "articles_admin_delete"
  ON articles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- 8. SERVICES POLICIES
-- ============================================================

CREATE POLICY "services_public_read"
  ON services FOR SELECT TO anon, authenticated
  USING (
    published = true
    OR EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "services_admin_insert"
  ON services FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "services_admin_update"
  ON services FOR UPDATE TO authenticated
  USING    (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "services_admin_delete"
  ON services FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- 9. SITE SETTINGS POLICIES
-- ============================================================

-- Public site reads settings for phone/whatsapp in header & footer
CREATE POLICY "site_settings_public_read"
  ON site_settings FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings_admin_insert"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "site_settings_admin_update"
  ON site_settings FOR UPDATE TO authenticated
  USING    (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "site_settings_admin_delete"
  ON site_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============================================================
-- 10. STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Public read — images are served directly on the website
CREATE POLICY "uploads_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'uploads');

-- Admin-only writes (upload, replace, delete)
CREATE POLICY "uploads_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'uploads'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "uploads_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

CREATE POLICY "uploads_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'uploads'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid())
  );

-- ============================================================
-- 11. DEFAULT SITE SETTINGS SEED
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('logo_url',                 ''),
  ('favicon_url',              ''),
  ('site_title',               'كشف التسربات والعزل بالسعودية'),
  ('site_description',         'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية'),
  ('site_keywords',            'كشف تسربات المياه, عزل اسطح, عزل خزانات, شركة عزل مائي, كشف تسربات بالرياض, عزل فوم'),
  ('google_search_console_id', 'p1Pr6RMWOa4n1k3PPqxTbfzqsgTM1xUgQ9SHlRJdYho'),
  ('phone',                    '+966500000000'),
  ('phone_secondary',          '+966530955302'),
  ('whatsapp',                 '966500000000'),
  ('email',                    'info@tasreeb-ksa.com'),
  ('address',                  'المملكة العربية السعودية'),
  ('working_hours',            'على مدار 24 ساعة — 7 أيام في الأسبوع'),
  ('twitter_url',              ''),
  ('instagram_url',            ''),
  ('snapchat_url',             ''),
  ('tiktok_url',               ''),
  ('facebook_url',             ''),
  ('youtube_url',              ''),
  ('google_ads_id',            ''),
  ('google_analytics_id',      ''),
  ('google_tag_manager_id',    ''),
  ('snapchat_pixel_id',        ''),
  ('tiktok_pixel_id',          ''),
  ('meta_pixel_id',            ''),
  ('custom_head_code',         ''),
  ('custom_body_code',         '')
ON CONFLICT (key) DO NOTHING;
