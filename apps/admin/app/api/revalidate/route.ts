import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route Handler for revalidating the public Astro site's ISR cache.
 * Using a Route Handler instead of a Server Action avoids interfering
 * with React's transition/navigation lifecycle that causes infinite loading.
 *
 * POST /api/revalidate  { paths: ["/", "/articles", "/articles/my-slug"] }
 */
export async function POST(request: NextRequest) {
  const token = process.env.REVALIDATION_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

  if (!token || !baseUrl) {
    return NextResponse.json(
      { success: false, error: 'Missing REVALIDATION_TOKEN or NEXT_PUBLIC_SITE_URL' },
      { status: 500 }
    )
  }

  let paths: string[] = []
  try {
    const body = await request.json()
    paths = body.paths ?? []
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (paths.length === 0) {
    return NextResponse.json({ success: true, message: 'No paths to revalidate' })
  }

  // Fire all requests with a 5-second timeout each
  const results = await Promise.allSettled(
    paths.map(async (path: string) => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const url = `${baseUrl}${normalizedPath}`

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)

      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { 'x-prerender-revalidate': token },
          signal: controller.signal,
        })
        console.log(`Revalidated ${url}: ${res.status}`)
        return { path: normalizedPath, status: res.status }
      } catch (err: any) {
        const reason = err?.name === 'AbortError' ? 'timeout' : err?.message
        console.warn(`Revalidation failed for ${url}: ${reason}`)
        return { path: normalizedPath, status: 'failed', reason }
      } finally {
        clearTimeout(timer)
      }
    })
  )

  return NextResponse.json({ success: true, results })
}
