export type Article = {
  id: string
  title: string
  slug: string
  content: string
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  published: boolean
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  title: string
  slug: string
  description: string
  meta_description: string | null
  image_url: string | null
  sort_order: number
  published: boolean
  faqs: { q: string; a: string }[] | null
  created_at: string
  updated_at: string
}

export type SiteSetting = {
  id: string
  key: string
  value: string
  updated_at: string
}

/** Typed map of all site settings keys */
export type SiteSettings = {
  // Brand & Media
  logo_url: string
  favicon_url: string

  // SEO & General
  site_title: string
  site_description: string
  site_keywords: string
  google_search_console_id: string

  // Contact & Location
  phone: string
  phone_secondary: string
  whatsapp: string
  email: string
  address: string
  working_hours: string

  // Social Links
  twitter_url: string
  instagram_url: string
  snapchat_url: string
  tiktok_url: string
  facebook_url: string
  youtube_url: string
  custom_social_links: string // JSON of CustomSocialLink[]

  // Analytics & Ad Pixels
  google_ads_id: string
  google_analytics_id: string
  google_tag_manager_id: string
  snapchat_pixel_id: string
  tiktok_pixel_id: string
  meta_pixel_id: string

  // Custom Scripts / Code
  custom_head_code: string
  custom_body_code: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  logo_url: '',
  favicon_url: '',
  site_title: 'كشف التسربات والعزل بالسعودية',
  site_description: 'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية',
  site_keywords: 'كشف تسربات المياه, عزل اسطح, عزل خزانات, شركة عزل مائي, كشف تسربات بالرياض, عزل فوم',
  google_search_console_id: 'p1Pr6RMWOa4n1k3PPqxTbfzqsgTM1xUgQ9SHlRJdYho',
  phone: '+966536207027',
  phone_secondary: '+966530955302',
  whatsapp: '966536207027',
  email: 'info@tasreeb-ksa.com',
  address: 'المملكة العربية السعودية',
  working_hours: 'على مدار 24 ساعة — 7 أيام في الأسبوع',
  twitter_url: '',
  instagram_url: '',
  snapchat_url: '',
  tiktok_url: '',
  facebook_url: '',
  youtube_url: '',
  custom_social_links: '[]',
  google_ads_id: '',
  google_analytics_id: '',
  google_tag_manager_id: '',
  snapchat_pixel_id: '',
  tiktok_pixel_id: '',
  meta_pixel_id: '',
  custom_head_code: '',
  custom_body_code: '',
}

export type CustomSocialLink = {
  id: string
  name: string
  url: string
  icon?: string
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<ArticleInsert>

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type ServiceUpdate = Partial<ServiceInsert>
