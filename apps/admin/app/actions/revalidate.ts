'use server'

/**
 * Server-side revalidation helper — ONLY for use inside inline 'use server'
 * form actions (like delete handlers in server components).
 *
 * ⚠️ DO NOT import this in client components — it will cause infinite loading.
 *    Client components should use `@/lib/revalidate` → triggerRevalidation() instead.
 */
export async function revalidateAstroPaths(paths: string[]) {
  const token = process.env.REVALIDATION_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''

  if (!token || !baseUrl) {
    console.warn('⚠️ Revalidation skipped: missing REVALIDATION_TOKEN or NEXT_PUBLIC_SITE_URL')
    return
  }

  // Fire all requests with a 5-second timeout each — don't let this block the delete flow
  await Promise.allSettled(
    paths.map(async (path) => {
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
      } catch (err: any) {
        console.warn(`Revalidation failed for ${url}: ${err?.name === 'AbortError' ? 'timeout' : err?.message}`)
      } finally {
        clearTimeout(timer)
      }
    })
  )
}
