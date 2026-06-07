export const SITE_NAME = 'كشف التسربات والعزل بالسعودية'
export const SITE_DESCRIPTION =
  'شركة متخصصة في كشف تسربات المياه وعزل الأسطح والخزانات في المملكة العربية السعودية. خدمة احترافية على مدار الساعة.'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://saudi-leaks.com'
export const PHONE = process.env.NEXT_PUBLIC_PHONE || '+966500000000'
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '+966500000000'

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function whatsappLink(message: string = ''): string {
  const number = formatPhone(WHATSAPP)
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encoded}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
