import { createClient } from './supabase'
import type { SiteSettings } from '@saudi-leaks/shared/types'
import { DEFAULT_SETTINGS } from '@saudi-leaks/shared/types'

// Re-export defaults
const DEFAULTS: SiteSettings = DEFAULT_SETTINGS

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
      // Brand & Media
      logo_url:                 map['logo_url']                 ?? DEFAULTS.logo_url,
      favicon_url:              map['favicon_url']              ?? DEFAULTS.favicon_url,
      color_scheme:             map['color_scheme']             ?? DEFAULTS.color_scheme,

      // SEO & General
      site_title:               map['site_title']               ?? DEFAULTS.site_title,
      site_description:         map['site_description']         ?? DEFAULTS.site_description,
      site_keywords:            map['site_keywords']            ?? DEFAULTS.site_keywords,
      google_search_console_id: map['google_search_console_id'] ?? DEFAULTS.google_search_console_id,

      // Contact & Location
      phone:                    map['phone']                    ?? DEFAULTS.phone,
      phone_secondary:          map['phone_secondary']          ?? DEFAULTS.phone_secondary,
      whatsapp:                 map['whatsapp']                 ?? DEFAULTS.whatsapp,
      email:                    map['email']                    ?? DEFAULTS.email,
      address:                  map['address']                  ?? DEFAULTS.address,
      working_hours:            map['working_hours']            ?? DEFAULTS.working_hours,

      // Social Links
      twitter_url:              map['twitter_url']              ?? DEFAULTS.twitter_url,
      instagram_url:            map['instagram_url']            ?? DEFAULTS.instagram_url,
      snapchat_url:             map['snapchat_url']             ?? DEFAULTS.snapchat_url,
      tiktok_url:               map['tiktok_url']               ?? DEFAULTS.tiktok_url,
      facebook_url:             map['facebook_url']             ?? DEFAULTS.facebook_url,
      youtube_url:              map['youtube_url']              ?? DEFAULTS.youtube_url,
      custom_social_links:      map['custom_social_links']      ?? DEFAULTS.custom_social_links,

      // Analytics & Ad Pixels
      google_ads_id:            map['google_ads_id']            ?? DEFAULTS.google_ads_id,
      google_analytics_id:      map['google_analytics_id']      ?? DEFAULTS.google_analytics_id,
      google_tag_manager_id:    map['google_tag_manager_id']    ?? DEFAULTS.google_tag_manager_id,
      snapchat_pixel_id:        map['snapchat_pixel_id']        ?? DEFAULTS.snapchat_pixel_id,
      tiktok_pixel_id:          map['tiktok_pixel_id']          ?? DEFAULTS.tiktok_pixel_id,
      meta_pixel_id:            map['meta_pixel_id']            ?? DEFAULTS.meta_pixel_id,

      // Custom Code
      custom_head_code:         map['custom_head_code']         ?? DEFAULTS.custom_head_code,
      custom_body_code:         map['custom_body_code']         ?? DEFAULTS.custom_body_code,
    }
  } catch {
    return DEFAULTS
  }
}
