# 🔍 كشف التسربات والعزل بالسعودية

> منصة متكاملة لشركة كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية

![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [SEO Features](#seo-features)
- [Admin Dashboard](#admin-dashboard)

---

## Overview

A high-performance, SEO-optimized monorepo platform built for a water leak detection and insulation services company based in Saudi Arabia. The platform consists of:

- **Public Website** — Astro-powered, statically rendered with ISR, serving Arabic (RTL) content
- **Admin Dashboard** — Next.js-powered CMS for managing articles, services, settings, and media
- **Shared Package** — Common types, utilities, and Supabase clients

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge CDN                   │
├────────────────────────┬────────────────────────────┤
│   Public Website       │    Admin Dashboard          │
│   (Astro + ISR)        │    (Next.js)                │
│   Port: 4321           │    Port: 3000               │
├────────────────────────┴────────────────────────────┤
│              Shared Package (types, utils)           │
├─────────────────────────────────────────────────────┤
│                Supabase (DB + Storage + Auth)        │
└─────────────────────────────────────────────────────┘
```

---

## Features

### 🌐 Public Website
- ⚡ Near-zero JavaScript — Astro ships no JS by default
- 🔄 ISR (Incremental Static Regeneration) with 60-second cache
- 🌙 Full RTL support with Arabic typography (Cairo font)
- 📱 Responsive design with animated mobile navigation
- ♿ Accessibility-first (skip links, ARIA, focus-visible, semantic HTML)
- 💬 WhatsApp & phone CTAs on every page
- 📖 Auto-generated Table of Contents from article headings
- ⏱️ Reading time estimation on articles
- ❓ Collapsible FAQ sections on service pages

### 🔧 Admin Dashboard
- 📝 Article editor with HTML toolbar (headings, bold, links, lists)
- 🖼️ Media Library — browse, upload, delete, and reuse images
- ❓ FAQ editor per service — manageable Q&A pairs
- 🖼️ Image upload to Supabase Storage with preview
- ⚙️ Live site settings (title, description, phone, WhatsApp, Google Ads)
- 🔄 Auto-revalidation — changes propagate to the public site within 60s
- ⚠️ Unsaved changes warning (beforeunload)

### 📈 SEO (Score: 9.5/10)
- JSON-LD structured data (Article, FAQPage, Service, BreadcrumbList, LocalBusiness, CollectionPage, ItemList)
- Dynamic `sitemap.xml` with `lastmod` timestamps
- Dynamic `robots.txt` with sitemap URL
- Open Graph + Twitter Card meta tags with `og:image:alt`
- Canonical URLs on every page
- Geo-targeting meta tags (Saudi Arabia)
- Auto-generated meta descriptions from content
- Proper 404 pages (not 302 redirects)
- `loading="lazy"` + `fetchpriority="high"` on LCP images
- `width` / `height` attributes for CLS prevention

---

## Tech Stack

| Layer | Technology |
|---|---|
| Public Website | [Astro](https://astro.build/) v5 with `@astrojs/vercel` adapter |
| Admin Dashboard | [Next.js](https://nextjs.org/) v16 with Turbopack |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Monorepo | [Turborepo](https://turbo.build/) |
| Deployment | [Vercel](https://vercel.com/) |
| Language | TypeScript |

---

## Project Structure

```
saudi-leaks/
├── apps/
│   ├── web/                    # Public website (Astro)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── home/       # HeroSection, CTASection, ServicesPreview, LatestArticles
│   │   │   │   └── layout/     # Header, Footer, FloatingWhatsApp
│   │   │   ├── layouts/        # BaseLayout, PublicLayout
│   │   │   ├── pages/
│   │   │   │   ├── articles/   # Article listing + [slug] detail
│   │   │   │   ├── services/   # Service listing + [slug] detail
│   │   │   │   ├── index.astro # Homepage
│   │   │   │   ├── sitemap.xml.ts
│   │   │   │   └── robots.txt.ts
│   │   │   ├── lib/            # supabase.ts, settings.ts
│   │   │   └── styles/         # global.css
│   │   └── astro.config.mjs
│   │
│   └── admin/                  # Admin dashboard (Next.js)
│       ├── app/
│       │   ├── admin/
│       │   │   ├── articles/   # CRUD for articles
│       │   │   ├── services/   # CRUD for services
│       │   │   ├── settings/   # Site settings editor
│       │   │   └── page.tsx    # Dashboard overview
│       │   ├── login/          # Auth login page
│       │   └── api/revalidate/ # ISR cache purge endpoint
│       ├── components/admin/
│       │   ├── ArticleForm.tsx
│       │   ├── ServiceForm.tsx
│       │   ├── ImageUpload.tsx
│       │   └── MediaLibrary.tsx
│       └── lib/revalidate.ts
│
└── packages/
    └── shared/                 # Shared utilities
        ├── types.ts            # Article, Service, SiteSetting types
        ├── utils.ts            # slugify, formatDate, formatPhone
        └── supabase/           # Client + Server Supabase instances
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 10
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/saudi-leaks.git
cd saudi-leaks

# Install dependencies
npm install
```

### Environment Setup

Create `.env.local` files in both `apps/web/` and `apps/admin/`:

```bash
cp .env.local.example apps/web/.env.local
cp .env.local.example apps/admin/.env.local
```

Fill in the values (see [Environment Variables](#environment-variables)).

### Development

```bash
# Run both apps in development mode
npm run dev

# Or run individually
npx turbo dev --filter=@saudi-leaks/web    # Public site → http://localhost:4321
npx turbo dev --filter=@saudi-leaks/admin  # Admin → http://localhost:3000
```

### Build

```bash
npm run build
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | ✅ |
| `NEXT_PUBLIC_SITE_URL` | Public website URL (e.g., `https://yourdomain.com`) | ✅ |
| `NEXT_PUBLIC_ADMIN_URL` | Admin dashboard URL | ⚠️ Admin only |

---

## Deployment

Both apps are deployed on **Vercel** as separate projects from the same monorepo.

### Web (Public Site)
- **Framework**: Astro
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && npx turbo build --filter=@saudi-leaks/web`
- **Output Directory**: `apps/web/.vercel/output`

### Admin (Dashboard)
- **Framework**: Next.js
- **Root Directory**: `apps/admin`
- **Build Command**: `cd ../.. && npx turbo build --filter=@saudi-leaks/admin`

---

## SEO Features

### Structured Data (JSON-LD)

| Page | Schema Types |
|---|---|
| Homepage | `LocalBusiness` (enhanced with geo, services, hours) |
| Articles listing | `CollectionPage` + `ItemList` |
| Article detail | `Article` + `BreadcrumbList` |
| Services listing | `CollectionPage` + `ItemList` |
| Service detail | `Service` + `BreadcrumbList` + `FAQPage` |

### Performance Optimizations

| Optimization | Implementation |
|---|---|
| Static rendering | Astro compiles to static HTML, ships zero JS |
| ISR caching | Pages revalidate every 60 seconds via Vercel |
| Font loading | Cairo font loaded async (non-render-blocking) |
| Image optimization | `loading="lazy"`, `decoding="async"`, explicit `width`/`height` |
| LCP priority | Hero images use `fetchpriority="high"` + `loading="eager"` |
| Parallel queries | `Promise.all()` for concurrent database requests |

---

## Admin Dashboard

### Managing Articles
1. Navigate to **المقالات** (Articles)
2. Click **+ مقال جديد** to create, or click any article to edit
3. Use the toolbar for formatting (H2, H3, bold, links, lists)
4. Click **📷 صورة** to open the Media Library and insert images
5. Fill in SEO fields (meta title, meta description)
6. Toggle publishing status and save

### Managing Services
1. Navigate to **الخدمات** (Services)
2. Create or edit services with descriptions and images
3. Use the **❓ FAQ Editor** to add/remove Q&A pairs
4. FAQs automatically generate Google FAQ rich results

### Managing Settings
1. Navigate to **الإعدادات** (Settings)
2. Update site title, description, phone, WhatsApp, and Google Ads ID
3. Changes propagate to the public site within 60 seconds

---

## Database Schema

### `articles`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `title` | text | Article title |
| `slug` | text | URL slug (unique) |
| `content` | text | HTML content |
| `image_url` | text | Hero image URL |
| `meta_title` | text | SEO title override |
| `meta_description` | text | SEO description |
| `published` | boolean | Visibility toggle |
| `created_at` | timestamptz | Creation date |
| `updated_at` | timestamptz | Last modified |

### `services`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `title` | text | Service name |
| `slug` | text | URL slug (unique) |
| `description` | text | Service description |
| `meta_description` | text | SEO description |
| `image_url` | text | Service image URL |
| `sort_order` | integer | Display order |
| `published` | boolean | Visibility toggle |
| `faqs` | jsonb | FAQ Q&A pairs `[{q, a}]` |
| `created_at` | timestamptz | Creation date |
| `updated_at` | timestamptz | Last modified |

### `site_settings`
| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `key` | text | Setting key (unique) |
| `value` | text | Setting value |
| `updated_at` | timestamptz | Last modified |

---

## License

This project is proprietary. All rights reserved.