import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://example.com'
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  )
}
