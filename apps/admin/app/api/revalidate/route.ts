import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route Handler for revalidating the public Astro site's ISR cache.
 *
 * POST /api/revalidate         { paths: ["/", "/articles", "/articles/my-slug"] }
 * GET  /api/revalidate?path=/  (manual test — visit in browser to debug)
 */

// ── POST: Called by the admin forms after save ──────────────────────────────
export async function POST(request: NextRequest) {
  const token = process.env.REVALIDATION_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

  if (!token || !baseUrl) {
    return NextResponse.json(
      { success: false, error: 'Missing REVALIDATION_TOKEN or NEXT_PUBLIC_SITE_URL', token: !!token, baseUrl: !!baseUrl },
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

  const results = await revalidatePaths(paths, baseUrl, token)
  return NextResponse.json({ success: true, results })
}

// ── GET: Manual testing endpoint ────────────────────────────────────────────
// Visit: https://your-admin.vercel.app/api/revalidate?path=/
// This lets you manually verify the revalidation is working end-to-end
export async function GET(request: NextRequest) {
  const token = process.env.REVALIDATION_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

  if (!token || !baseUrl) {
    return NextResponse.json({
      success: false,
      error: 'Missing env vars',
      hasToken: !!token,
      hasBaseUrl: !!baseUrl,
      hint: 'Set REVALIDATION_TOKEN and NEXT_PUBLIC_SITE_URL in Vercel env vars for the Admin project',
    }, { status: 500 })
  }

  const path = request.nextUrl.searchParams.get('path') || '/'
  const results = await revalidatePaths([path], baseUrl, token)

  return NextResponse.json({
    success: true,
    config: {
      baseUrl,
      tokenLength: token.length,
      tokenPreview: token.slice(0, 4) + '...',
    },
    results,
  })
}

// ── Shared revalidation logic ───────────────────────────────────────────────
async function revalidatePaths(paths: string[], baseUrl: string, token: string) {
  const results = await Promise.allSettled(
    paths.map(async (path: string) => {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const url = `${baseUrl}${normalizedPath}`

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000) // 8s timeout

      try {
        const res = await fetch(url, {
          method: 'HEAD',
          headers: { 'x-prerender-revalidate': token },
          signal: controller.signal,
        })

        // Vercel returns this header to confirm revalidation happened
        const cacheStatus = res.headers.get('x-vercel-cache') || 'unknown'

        console.log(`Revalidated ${url}: status=${res.status}, cache=${cacheStatus}`)
        return {
          path: normalizedPath,
          url,
          httpStatus: res.status,
          vercelCache: cacheStatus,
          revalidated: cacheStatus === 'REVALIDATED' || res.status === 200,
        }
      } catch (err: any) {
        const reason = err?.name === 'AbortError' ? 'timeout (8s)' : err?.message
        console.warn(`Revalidation failed for ${url}: ${reason}`)
        return { path: normalizedPath, url, status: 'failed', reason }
      } finally {
        clearTimeout(timer)
      }
    })
  )

  return results.map(r => r.status === 'fulfilled' ? r.value : { status: 'error', reason: String(r.reason) })
}
