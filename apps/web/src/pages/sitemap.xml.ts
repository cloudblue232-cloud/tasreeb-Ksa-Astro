import type { APIRoute } from 'astro'
import { createClient as createStaticClient } from '../lib/supabase'

export const GET: APIRoute = async () => {
  const SITE_URL = (import.meta.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '')
  const supabase = createStaticClient()

  const [{ data: articles }, { data: services }] = await Promise.all([
    supabase.from('articles').select('slug, updated_at').eq('published', true).order('updated_at', { ascending: false }),
    supabase.from('services').select('slug, created_at').eq('published', true).order('created_at', { ascending: false }),
  ])

  const now = new Date().toISOString()

  const staticUrls = [
    { loc: SITE_URL, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/services`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/articles`, priority: '0.9', changefreq: 'daily' },
  ]

  const serviceUrls = (services ?? []).map(s => ({
    loc: `${SITE_URL}/services/${s.slug}`,
    lastmod: s.created_at,
    priority: '0.85',
    changefreq: 'monthly',
  }))

  const articleUrls = (articles ?? []).map(a => ({
    loc: `${SITE_URL}/articles/${a.slug}`,
    lastmod: a.updated_at,
    priority: '0.8',
    changefreq: 'monthly',
  }))

  const allUrls = [...staticUrls, ...serviceUrls, ...articleUrls]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : `<lastmod>${now}</lastmod>`}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
