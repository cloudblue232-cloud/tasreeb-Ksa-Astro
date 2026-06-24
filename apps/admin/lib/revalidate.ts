/**
 * Client-side helper to trigger ISR revalidation via our API route.
 * This is intentionally NOT a 'use server' action — calling server actions
 * creates React transitions that interfere with router.push() and cause
 * infinite loading states in production.
 *
 * Instead, this uses a plain fetch() to our API route handler, which is
 * completely decoupled from React's lifecycle.
 */
export function triggerRevalidation(paths: string[]) {
  // Fire-and-forget: don't await, don't block navigation
  fetch('/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paths }),
  }).catch(() => {
    // Silently ignore — revalidation is best-effort
  })
}
