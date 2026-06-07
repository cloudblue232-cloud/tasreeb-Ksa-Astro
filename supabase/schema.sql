-- ============================================================
-- كشف التسربات والعزل بالسعودية — Supabase Schema v2
-- ============================================================
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query
-- For existing projects: use supabase/migration_v2.sql instead

-- ============================================================
-- 1. ARTICLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS articles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  content          TEXT NOT NULL,
  image_url        TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  published        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_slug      ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);

-- ============================================================
-- 2. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT NOT NULL,
  meta_description TEXT,
  image_url        TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  published        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_services_slug      ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_published ON services(published);
CREATE INDEX IF NOT EXISTS idx_services_sort      ON services(sort_order);

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS POLICIES: ARTICLES
-- ============================================================
-- Public can read published articles only
CREATE POLICY "articles_select_public"
  ON articles FOR SELECT
  TO anon, authenticated
  USING (published = true OR auth.role() = 'authenticated');

-- Authenticated admin only (set app.admin_email via ALTER DATABASE)
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

-- ============================================================
-- 5. RLS POLICIES: SERVICES
-- ============================================================
CREATE POLICY "services_select_public"
  ON services FOR SELECT
  TO anon, authenticated
  USING (published = true OR auth.role() = 'authenticated');

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

-- ============================================================
-- 6. SET ADMIN EMAIL
-- ============================================================
ALTER DATABASE postgres SET app.admin_email = 'cloudblue232@gmail.com';

-- ============================================================
-- 7. STORAGE BUCKET SETUP
-- Dashboard → Storage → New Bucket → Name: "uploads" → Public: YES
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "uploads_read_public"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "uploads_insert_admin"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "uploads_update_admin"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "uploads_delete_admin"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads');
