'use server'

/**
 * Next.js Server Action to securely revalidate Astro site paths.
 * We do this on the server so we don't expose REVALIDATION_TOKEN to the browser.
 */
export async function revalidateAstroPaths(paths: string[]) {
  const token = process.env.REVALIDATION_TOKEN
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:4321'

  if (!token) {
    console.warn('⚠️ No REVALIDATION_TOKEN found in environment.')
    return { success: false, error: 'No token' }
  }

  try {
    const promises = paths.map(async (path) => {
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      const url = `${baseUrl}${normalizedPath}`
      
      console.log(`Revalidating: ${url}`)
      
      return fetch(url, {
        method: 'HEAD', // HEAD is enough to trigger Vercel's x-prerender-revalidate
        headers: {
          'x-prerender-revalidate': token,
        },
      })
    })

    const results = await Promise.allSettled(promises)
    const failures = results.filter(r => r.status === 'rejected')
    
    if (failures.length > 0) {
      console.error(`Failed to revalidate ${failures.length} paths`)
      return { success: false, error: 'Some paths failed to revalidate' }
    }

    return { success: true }
  } catch (err) {
    console.error('Revalidation error:', err)
    return { success: false, error: 'Network error during revalidation' }
  }
}
