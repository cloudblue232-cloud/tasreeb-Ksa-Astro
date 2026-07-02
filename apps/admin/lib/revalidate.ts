/**
 * Client-side helper to trigger ISR revalidation via our API route.
 * This is intentionally NOT a 'use server' action — calling server actions
 * creates React transitions that interfere with router.push() and cause
 * infinite loading states in production.
 *
 * Uses keepalive: true so the request survives page navigation.
 */
export function triggerRevalidation(paths: string[]) {
  // Fire-and-forget with keepalive to survive navigation
  // navigator.sendBeacon doesn't support custom headers, so we use fetch + keepalive
  try {
    fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
      keepalive: true, // Critical: keeps the request alive even when the page navigates away
    }).catch(() => {
      // Silently ignore — revalidation is best-effort
    })
  } catch {
    // Silently ignore — some browsers may throw on keepalive with large payloads
  }
}
