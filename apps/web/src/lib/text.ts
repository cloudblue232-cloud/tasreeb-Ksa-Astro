/** Strip HTML tags and collapse whitespace — for cards, meta tags and JSON-LD. */
export function stripHtml(html: string): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const HAS_HTML = /<\/?[a-z][\s\S]*>/i

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Render a rich-text field. Content that already contains HTML (written with the
 * admin editor toolbar) is returned as-is; legacy plain-text descriptions are
 * escaped and turned into paragraphs so line breaks are preserved.
 */
export function renderRichText(value: string): string {
  const text = (value ?? '').trim()
  if (!text) return ''
  if (HAS_HTML.test(text)) return text
  return text
    .split(/\n{2,}/)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}
