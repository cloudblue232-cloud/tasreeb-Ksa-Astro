import { createClient } from './supabase'
import type { SiteSettings, DEFAULT_SETTINGS } from '@saudi-leaks/shared/types'

// Re-export defaults inline to avoid import issues in Astro
const DEFAULTS: SiteSettings = {
  site_title: 'كشف التسربات والعزل بالسعودية',
  site_description: 'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية',
  phone: '+966500000000',
  whatsapp: '966500000000',
  google_ads_id: '',
}

/**
 * Fetches all site_settings from Supabase and returns a typed object.
 * Falls back to defaults if Supabase is unreachable or a key is missing.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')

    if (error || !data) return DEFAULTS

    // Convert array of {key, value} rows → typed object
    const map = Object.fromEntries(data.map(row => [row.key, row.value]))

    return {
      site_title:       map['site_title']       ?? DEFAULTS.site_title,
      site_description: map['site_description'] ?? DEFAULTS.site_description,
      phone:            map['phone']             ?? DEFAULTS.phone,
      whatsapp:         map['whatsapp']          ?? DEFAULTS.whatsapp,
      google_ads_id:    map['google_ads_id']     ?? DEFAULTS.google_ads_id,
    }
  } catch {
    return DEFAULTS
  }
}
