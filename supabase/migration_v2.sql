-- ============================================================
-- كشف التسربات والعزل بالسعودية — Migration v3
-- ============================================================
-- Run this on EXISTING databases that already have the v1 or v2
-- schema. It is fully idempotent (safe to run more than once).
--
-- For a brand-new project, use supabase/schema.sql instead.
-- ============================================================

-- ============================================================
-- 1. SHARED TRIGGER FUNCTION (create or replace)
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
-- New in v3: replaces the old app.admin_email approach.
-- After running, insert your Supabase Auth user UID:
--
--   INSERT INTO admins (user_id)
--   VALUES ('your-auth-user-uuid-here');
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  user_id    UUID        PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_own" ON admins;
CREATE POLICY "admins_select_own"
  ON admins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 3. ARTICLES — ensure all columns exist
-- ============================================================
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS meta_title       TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS published        BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- ============================================================
-- 4. SERVICES — ensure all columns exist (including faqs)
-- ============================================================
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS sort_order       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published        BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- faqs: JSON array [{q, a}] managed by admin ServiceForm editor
  ADD COLUMN IF NOT EXISTS faqs             JSONB   NOT NULL DEFAULT '[]'::jsonb;

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
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT        NOT NULL UNIQUE,
  value      TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add created_at if it was missing in an older version
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 6. ENABLE RLS
-- ============================================================
ALTER TABLE articles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. DROP OLD EMAIL-BASED POLICIES (v1/v2)
-- ============================================================
DROP POLICY IF EXISTS "articles_select_public"  ON articles;
DROP POLICY IF EXISTS "articles_insert_admin"   ON articles;
DROP POLICY IF EXISTS "articles_update_admin"   ON articles;
DROP POLICY IF EXISTS "articles_delete_admin"   ON articles;

DROP POLICY IF EXISTS "services_select_public"  ON services;
DROP POLICY IF EXISTS "services_insert_admin"   ON services;
DROP POLICY IF EXISTS "services_update_admin"   ON services;
DROP POLICY IF EXISTS "services_delete_admin"   ON services;

DROP POLICY IF EXISTS "site_settings_select_public" ON site_settings;
DROP POLICY IF EXISTS "site_settings_insert_admin"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_admin"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_insert"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_update"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_delete"  ON site_settings;

-- ============================================================
-- 8. ARTICLES POLICIES (admins-table based)
-- ============================================================
DROP POLICY IF EXISTS "articles_public_read"   ON articles;
DROP POLICY IF EXISTS "articles_admin_insert"  ON articles;
DROP POLICY IF EXISTS "articles_admin_update"  ON articles;
DROP POLICY IF EXISTS "articles_admin_delete"  ON articles;

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
-- 9. SERVICES POLICIES (admins-table based)
-- ============================================================
DROP POLICY IF EXISTS "services_public_read"   ON services;
DROP POLICY IF EXISTS "services_admin_insert"  ON services;
DROP POLICY IF EXISTS "services_admin_update"  ON services;
DROP POLICY IF EXISTS "services_admin_delete"  ON services;

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
-- 10. SITE SETTINGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "site_settings_public_read"   ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_insert"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_update"  ON site_settings;
DROP POLICY IF EXISTS "site_settings_admin_delete"  ON site_settings;

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
-- 11. STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old permissive storage policies
DROP POLICY IF EXISTS "uploads_read_public"  ON storage.objects;
DROP POLICY IF EXISTS "uploads_insert_admin" ON storage.objects;
DROP POLICY IF EXISTS "uploads_update_admin" ON storage.objects;
DROP POLICY IF EXISTS "uploads_delete_admin" ON storage.objects;
DROP POLICY IF EXISTS "uploads_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "uploads_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "uploads_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "uploads_admin_delete" ON storage.objects;

-- Public read — images served on the website
CREATE POLICY "uploads_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'uploads');

-- Admin-only writes
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
-- 12. DEFAULT SITE SETTINGS SEED
-- ============================================================
INSERT INTO site_settings (key, value) VALUES
  ('logo_url',                 ''),
  ('favicon_url',              ''),
  ('site_title',               'كشف التسربات والعزل بالسعودية'),
  ('site_description',         'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية'),
  ('site_keywords',            'كشف تسربات المياه, عزل اسطح, عزل خزانات, شركة عزل مائي, كشف تسربات بالرياض, عزل فوم'),
  ('google_search_console_id', 'p1Pr6RMWOa4n1k3PPqxTbfzqsgTM1xUgQ9SHlRJdYho'),
  ('phone',                    '+966536207027'),
  ('phone_secondary',          '+966530955302'),
  ('whatsapp',                 '966536207027'),
  ('email',                    'info@tasreeb-ksa.com'),
  ('address',                  'المملكة العربية السعودية'),
  ('working_hours',            'على مدار 24 ساعة — 7 أيام في الأسبوع'),
  ('custom_social_links',      '[]'),
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

