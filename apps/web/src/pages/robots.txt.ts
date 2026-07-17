import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const SITE_URL = (import.meta.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '')
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
}
