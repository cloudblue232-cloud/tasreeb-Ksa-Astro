-- ============================================================
-- Migration v2 → v3 — Enhancements + Site Settings
-- Run this in Supabase SQL Editor for EXISTING projects
-- ============================================================

-- 1. Add published field to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;

-- 2. Add published field to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true;

-- 3. Add sort_order to services (lower = appears first)
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- 4. Add meta_description to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- 5. Add updated_at to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;

-- 6. Create updated_at trigger for services
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Indexes on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- 8. Index on published for filtering
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(published);

-- 9. Tighter RLS — restrict writes to specific admin email
--    REPLACE 'your@email.com' with your actual admin email
DROP POLICY IF EXISTS "articles_insert_admin" ON articles;
DROP POLICY IF EXISTS "articles_update_admin" ON articles;
DROP POLICY IF EXISTS "articles_delete_admin" ON articles;
DROP POLICY IF EXISTS "services_insert_admin" ON services;
DROP POLICY IF EXISTS "services_update_admin" ON services;
DROP POLICY IF EXISTS "services_delete_admin" ON services;

-- Re-create with email check (replace placeholder with your admin email)
CREATE POLICY "articles_insert_admin"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "articles_update_admin"
  ON articles FOR UPDATE TO authenticated
  USING (auth.email() = current_setting('app.admin_email', true))
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "articles_delete_admin"
  ON articles FOR DELETE TO authenticated
  USING (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "services_insert_admin"
  ON services FOR INSERT TO authenticated
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "services_update_admin"
  ON services FOR UPDATE TO authenticated
  USING (auth.email() = current_setting('app.admin_email', true))
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "services_delete_admin"
  ON services FOR DELETE TO authenticated
  USING (auth.email() = current_setting('app.admin_email', true));

-- Set your admin email (already set if you ran migration v2)
-- ALTER DATABASE postgres SET app.admin_email = 'cloudblue232@gmail.com';

-- ============================================================
-- v3: SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for public site)
CREATE POLICY "site_settings_select_public"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admin can write
CREATE POLICY "site_settings_insert_admin"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

CREATE POLICY "site_settings_update_admin"
  ON site_settings FOR UPDATE TO authenticated
  USING (auth.email() = current_setting('app.admin_email', true))
  WITH CHECK (auth.email() = current_setting('app.admin_email', true));

-- Seed default values (safe to run multiple times)
INSERT INTO site_settings (key, value) VALUES
  ('site_title',       'كشف التسربات والعزل بالسعودية'),
  ('site_description', 'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية'),
  ('phone',            '+966500000000'),
  ('whatsapp',         '966500000000'),
  ('google_ads_id',    '')
ON CONFLICT (key) DO NOTHING;

