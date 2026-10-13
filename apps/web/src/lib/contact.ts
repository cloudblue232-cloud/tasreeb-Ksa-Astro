import type { BrandIcon } from './brandIcons'

/**
 * Single source of truth for the company's contact channels.
 * Used by the /contact page (and can be reused by Footer/Header later).
 */

export const COMPANY_NAME = 'شركة أنظمة العزل الحديثة'
export const COMPANY_NAME_EN = 'Modern Insulation Systems'

export interface PhoneContact {
  /** E.164 format, e.g. +966536207027 */
  number: string
  label: string
}

export const PHONES: PhoneContact[] = [
  { number: '+966536207027', label: 'خط التواصل الأول' },
  { number: '+966530955302', label: 'خط التواصل الثاني' },
]

export interface SocialAccount {
  id: BrandIcon
  name: string
  handle: string
  url: string
  /** Brand colour used for the icon tile + hover glow */
  color: string
  /** Optional gradient background for the icon tile */
  gradient?: string
  cta: string
}

export const SOCIALS: SocialAccount[] = [
  {
    id: 'instagram',
    name: 'إنستغرام',
    handle: '@_modern_insulation_systems',
    url: 'https://www.instagram.com/_modern_insulation_systems/',
    color: '#E4405F',
    gradient: 'linear-gradient(45deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)',
    cta: 'شاهد أعمالنا',
  },
  {
    id: 'tiktok',
    name: 'تيك توك',
    handle: '@moderninsulationsystems',
    url: 'https://www.tiktok.com/@moderninsulationsystems',
    color: '#111111',
    gradient: 'linear-gradient(135deg, #25F4EE 0%, #111111 45%, #111111 55%, #FE2C55 100%)',
    cta: 'مقاطع قصيرة',
  },
  {
    id: 'youtube',
    name: 'يوتيوب',
    handle: '@Moderninsulationsystems',
    url: 'https://www.youtube.com/@Moderninsulationsystems',
    color: '#FF0000',
    cta: 'فيديوهات تعليمية',
  },
  {
    id: 'linkedin',
    name: 'لينكدإن',
    handle: 'Modern Insulation Systems',
    url: 'https://www.linkedin.com/in/%D8%A3%D9%86%D8%B8%D9%85%D8%A9-%D8%A7%D9%84%D8%B9%D8%B2%D9%84-%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AB%D8%A9-modern-insulation-systems-53605a438',
    color: '#0A66C2',
    cta: 'تابعنا مهنياً',
  },
]

export const LOCATION = {
  city: 'جدة',
  country: 'المملكة العربية السعودية',
  cityEn: 'Jeddah',
  countryCode: 'SA',
  /** Approximate city-centre coordinates — replace with the exact office pin when available */
  lat: 21.5433,
  lng: 39.1728,
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jeddah%2C+Saudi+Arabia',
  embedUrl: 'https://www.google.com/maps?q=Jeddah,+Saudi+Arabia&z=11&hl=ar&output=embed',
}

/** "+966536207027" → "+966 53 620 7027" */
export function formatPhone(e164: string): string {
  const m = e164.match(/^\+966(\d{2})(\d{3})(\d{4})$/)
  return m ? `+966 ${m[1]} ${m[2]} ${m[3]}` : e164
}

export function whatsappUrl(e164: string, message = 'مرحباً، أريد الاستفسار عن حلول العزل المناسبة لي'): string {
  return `https://wa.me/${e164.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}
