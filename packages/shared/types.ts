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
  site_title: string
  site_description: string
  phone: string
  whatsapp: string
  google_ads_id: string
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site_title: 'كشف التسربات والعزل بالسعودية',
  site_description: 'شركة متخصصة في كشف تسربات المياه والعزل الحراري والمائي في المملكة العربية السعودية',
  phone: '+966500000000',
  whatsapp: '966500000000',
  google_ads_id: '',
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>
export type ArticleUpdate = Partial<ArticleInsert>

export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>
export type ServiceUpdate = Partial<ServiceInsert>
