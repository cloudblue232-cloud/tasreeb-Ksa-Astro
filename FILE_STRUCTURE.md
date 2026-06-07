# 📁 File Structure & Role of Each File

> Saudi Leaks — Turborepo Monorepo  
> Last updated: May 2026

---

## Root

```
saudi-leaks/
```

| File | Role |
|------|------|
| `package.json` | Root workspace config — defines `apps/*` and `packages/*` as npm workspaces, installs Turborepo |
| `turbo.json` | Turborepo pipeline config — defines `build`, `dev`, and `lint` tasks with caching rules |
| `.env.local` | Root env variables (not used directly — each app has its own copy) |
| `.env.local.example` | Template showing required environment variables for Supabase and contact info |
| `.gitignore` | Git ignore rules — excludes `node_modules`, `.next`, `.turbo`, `.env.local` |
| `README.md` | Project documentation — architecture overview, setup guide, deployment instructions |
| `AGENTS.md` | AI coding agent instructions |
| `CLAUDE.md` | AI coding agent instructions |

---

## `supabase/` — Database

| File | Role |
|------|------|
| `schema.sql` | **Full PostgreSQL schema** — creates `articles` and `services` tables, sets up Row Level Security (RLS) policies (public = read-only, authenticated = full CRUD), creates `uploads` storage bucket with access policies, adds auto-updating `updated_at` trigger |
| `seed.sql` | **Sample Arabic content** — inserts 6 services (كشف تسربات المياه, عزل الأسطح, etc.) and 3 articles with full HTML content for testing |

---

## `packages/shared/` — Shared Library

Shared code imported by both `apps/web` and `apps/admin` via `@saudi-leaks/shared/*`.

| File | Role |
|------|------|
| `package.json` | Package manifest — exports all modules, declares `@supabase/supabase-js` and `@supabase/ssr` as dependencies |
| `types.ts` | **TypeScript interfaces** — defines `Article`, `Service`, `ArticleInsert`, and `ServiceInsert` types matching the database schema |
| `utils.ts` | **Shared utilities** — `slugify()` for generating URL slugs from Arabic text, `whatsappLink()` for WhatsApp deep links, `stripHtml()` and `truncate()` for content previews, `formatPhone()`, and exported constants (`SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `PHONE`) |

### `packages/shared/supabase/` — Supabase Clients

| File | Role |
|------|------|
| `client.ts` | **Browser-side Supabase client** — used in `'use client'` components (forms, image upload). Uses `createBrowserClient` from `@supabase/ssr` with anon key |
| `server.ts` | **Server-side Supabase client** — used in Server Components and Server Actions. Reads/writes cookies for session management via `next/headers` |
| `static.ts` | **Cookie-free Supabase client** — used in `generateStaticParams()` and `sitemap.ts` which run at build time without an HTTP request context. Uses plain `createClient` from `@supabase/supabase-js` |
| `admin.ts` | **Service-role Supabase client** — bypasses RLS with `SUPABASE_SERVICE_ROLE_KEY`. Used only in privileged server-side operations (e.g., admin data seeding). Never exposed to the browser |

---

## `apps/web/` — Public Website

The customer-facing site. Contains **zero admin code** — no admin routes, no admin components, no admin dependencies. Optimized for SEO and Core Web Vitals.

### Config Files

| File | Role |
|------|------|
| `package.json` | App manifest — depends on `@saudi-leaks/shared`, runs on port 3000 |
| `next.config.ts` | Next.js config — allows Supabase Storage images via `remotePatterns`, transpiles shared package |
| `tsconfig.json` | TypeScript config — `@/*` path alias points to this app's root |
| `postcss.config.mjs` | PostCSS config — enables Tailwind CSS v4 |
| `.env.local` | Environment variables (Supabase URL, anon key, site URL, phone numbers) |
| `.env.local.example` | Template for the above |

### `apps/web/app/` — Routes & Pages

| File | Role |
|------|------|
| `layout.tsx` | **Root layout** — sets `lang="ar"` and `dir="rtl"`, loads Cairo font from Google Fonts, defines global SEO metadata (title template, description, keywords, Open Graph, robots directives) |
| `globals.css` | **Global styles** — Tailwind v4 theme tokens (colors, gradients), custom component classes (`btn-primary`, `btn-whatsapp`, `card-hover`), prose styles for Arabic HTML content, RTL utilities |
| `sitemap.ts` | **Dynamic sitemap.xml** — fetches all article and service slugs from Supabase at build time, generates XML sitemap with priorities and change frequencies |
| `robots.ts` | **robots.txt** — allows all crawlers, points to sitemap URL |

### `apps/web/app/(public)/` — Public Pages

The `(public)` route group wraps all pages with Header + Footer + FloatingWhatsApp.

| File | Role |
|------|------|
| `layout.tsx` | **Public layout wrapper** — renders `<Header>`, `<main>{children}</main>`, `<Footer>`, and `<FloatingWhatsApp>` |
| `page.tsx` | **Home page (`/`)** — fetches services and latest articles from Supabase, renders Hero + Services Preview + CTA + Latest Articles sections. Includes `LocalBusiness` JSON-LD structured data for SEO |

#### `apps/web/app/(public)/services/`

| File | Role |
|------|------|
| `page.tsx` | **Services listing (`/services`)** — fetches all services, displays as a responsive grid with image cards, emoji fallback icons, and a bottom CTA banner |
| `[slug]/page.tsx` | **Service detail (`/services/[slug]`)** — SSG with ISR (revalidate every hour). Generates static params at build time. Renders service description, image, contact sidebar with call/WhatsApp CTAs, related services list. Includes `Service` JSON-LD structured data |

#### `apps/web/app/(public)/articles/`

| File | Role |
|------|------|
| `page.tsx` | **Articles listing (`/articles`)** — fetches all articles, displays as a card grid with dates, excerpts (auto-stripped from HTML), and "read more" links |
| `[slug]/page.tsx` | **Article detail (`/articles/[slug]`)** — SSG with ISR. Renders full HTML article content, breadcrumb navigation, publication date, contact sidebar, and related articles grid. Includes `Article` JSON-LD structured data. Generates dynamic Open Graph meta tags |

### `apps/web/components/` — UI Components

#### `apps/web/components/layout/`

| File | Role |
|------|------|
| `Header.tsx` | **Sticky header** — company logo/name on the right (RTL), navigation links center (الرئيسية, خدماتنا, المقالات), CTA buttons on the left (اتصل الآن, واتساب). Responsive mobile menu |
| `Footer.tsx` | **Dark footer** — company branding, quick links, services list, contact information, copyright notice |

#### `apps/web/components/home/`

| File | Role |
|------|------|
| `HeroSection.tsx` | **Full-width hero** — blue gradient background with wave SVG divider, large Arabic headline, description text, "24/7 Available" badge, stats grid (+15 years, +5000 clients, 95% satisfaction), dual CTA buttons (call + WhatsApp) |
| `ServicesPreview.tsx` | **Services preview grid** — shows first 6 services as cards with emoji icons and "view all" link. Receives services data as props from the home page |
| `LatestArticles.tsx` | **Latest articles section** — shows up to 4 recent articles as cards with dates and excerpts. Receives articles data as props |
| `CTASection.tsx` | **Trust badges + CTA banner** — displays trust indicators (licensed, insured, warranty, 24/7), then a full-width gradient CTA with call and WhatsApp buttons |

#### `apps/web/components/shared/`

| File | Role |
|------|------|
| `FloatingWhatsApp.tsx` | **Floating WhatsApp button** — fixed position bottom-left green circle with WhatsApp icon. Links to WhatsApp with pre-filled Arabic message. Visible on all public pages |

---

## `apps/admin/` — Admin Dashboard

Completely isolated admin panel. Runs on a separate port/domain. Entire app is behind Supabase authentication via the proxy. Contains **no public-facing content** — not indexed by search engines.

### Config Files

| File | Role |
|------|------|
| `package.json` | App manifest — depends on `@saudi-leaks/shared`, runs on port 3001 |
| `next.config.ts` | Next.js config — same as web (Supabase images + transpile shared) |
| `tsconfig.json` | TypeScript config — `@/*` path alias points to this app's root |
| `postcss.config.mjs` | PostCSS config — enables Tailwind CSS v4 |
| `proxy.ts` | **Auth proxy** (Next.js 16 convention, replaces middleware) — intercepts ALL requests. Unauthenticated users → redirect to `/login`. Authenticated users on `/login` → redirect to `/admin`. Refreshes Supabase session cookies on every request |
| `.env.local` | Environment variables (same Supabase credentials as web) |

### `apps/admin/app/` — Routes

| File | Role |
|------|------|
| `layout.tsx` | **Root layout** — Arabic RTL, Cairo font, `robots: noindex/nofollow` (never index admin), gray background |
| `globals.css` | **Admin styles** — same Tailwind v4 theme as web (shared design system) |

#### `apps/admin/app/login/`

| File | Role |
|------|------|
| `page.tsx` | **Login page** — centered card on blue gradient background, email + password form, calls `supabase.auth.signInWithPassword()`, redirects to `/admin` on success, shows error messages on failure |

#### `apps/admin/app/admin/`

| File | Role |
|------|------|
| `layout.tsx` | **Admin layout with auth guard** — Server Component that checks `supabase.auth.getUser()`. If no user → `redirect('/login')`. Renders sidebar navigation (`AdminNav`) + main content area |
| `page.tsx` | **Dashboard** — shows total counts of articles and services fetched from Supabase, quick-action links to manage content |

#### `apps/admin/app/admin/articles/`

| File | Role |
|------|------|
| `page.tsx` | **Articles list** — table showing all articles (title, slug, date) with edit/view/delete actions. Delete uses Server Action with `DeleteButton` client component for confirmation. Empty state with "add first article" link |
| `new/page.tsx` | **Create article** — renders `ArticleForm` component in create mode |
| `[id]/page.tsx` | **Edit article** — fetches article by ID, renders `ArticleForm` in edit mode with pre-filled data. Link to view live article |

#### `apps/admin/app/admin/services/`

| File | Role |
|------|------|
| `page.tsx` | **Services list** — same pattern as articles list — table with CRUD actions and Server Action delete |
| `new/page.tsx` | **Create service** — renders `ServiceForm` in create mode |
| `[id]/page.tsx` | **Edit service** — fetches service by ID, renders `ServiceForm` in edit mode |

### `apps/admin/components/admin/` — Admin UI

| File | Role |
|------|------|
| `AdminNav.tsx` | **Sidebar navigation** — company logo, links to dashboard/articles/services, displays current user email, logout button that calls `supabase.auth.signOut()` |
| `ArticleForm.tsx` | **Article CRUD form** — client component with fields: title (auto-generates slug), slug (editable, LTR), image upload, HTML content textarea, SEO section (meta title with char counter, meta description with char counter). Handles both create and update via Supabase client |
| `ServiceForm.tsx` | **Service CRUD form** — client component with fields: title (auto-generates slug), slug, image upload, description textarea. Same create/update pattern |
| `ImageUpload.tsx` | **Image uploader** — client component that uploads files to Supabase Storage `uploads` bucket. Shows drag-drop area, upload progress spinner, image preview with remove button, and manual URL input fallback. Validates file type (images only) and size (max 5MB) |
| `DeleteButton.tsx` | **Delete confirmation button** — client component wrapping a submit button with `window.confirm()` dialog. Needed because `onClick` handlers can't be passed in Server Components |

---

## File Count Summary

| Area | Files |
|------|-------|
| Root config | 8 |
| Supabase SQL | 2 |
| Shared package | 6 |
| Web app | 17 |
| Admin app | 18 |
| **Total** | **51 files** |
