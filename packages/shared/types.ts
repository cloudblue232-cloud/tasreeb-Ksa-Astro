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
  color_scheme: ColorSchemeId

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

export type ColorSchemeId =
  | 'ocean'
  | 'emerald'
  | 'royal'
  | 'teal'
  | 'amber'
  | 'ruby'
  | 'midnight'
  | 'bronze'
  | 'charcoal'

export interface ColorSchemeOption {
  id: ColorSchemeId
  nameAr: string
  nameEn: string
  description: string
  primary: string
  secondary: string
  accent: string
  lightBg: string
  previewGradient: string
}

export const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'ocean',
    nameAr: 'الأزرق المحيطي',
    nameEn: 'Ocean Blue',
    description: 'طابع مائي كلاسيكي لنقاء المياه وخدمات كشف التسربات',
    primary: '#2563eb',
    secondary: '#1e3a8a',
    accent: '#3b82f6',
    lightBg: '#eff6ff',
    previewGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)',
  },
  {
    id: 'emerald',
    nameAr: 'الزمرد السعودي',
    nameEn: 'Saudi Emerald',
    description: 'الهوية الوطنية الرسمية، الأمان والاعتمادية البيئية والعزل المعتمد',
    primary: '#059669',
    secondary: '#064e3b',
    accent: '#10b981',
    lightBg: '#ecfdf5',
    previewGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #047857 100%)',
  },
  {
    id: 'royal',
    nameAr: 'الكحلي والذهبي الملكي',
    nameEn: 'Royal Navy & Gold',
    description: 'هيبة وفخامة للشركات الكبرى والمشاريع الحكومية والقصور والفلل',
    primary: '#d97706',
    secondary: '#0f172a',
    accent: '#f59e0b',
    lightBg: '#f8fafc',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #b45309 100%)',
  },
  {
    id: 'teal',
    nameAr: 'الفيروزي الحديث',
    nameEn: 'Modern Teal',
    description: 'عصري ومتجدد يعكس أحدث أجهزة الفحص الإلكترونية الدقيقة دون تكسير',
    primary: '#0891b2',
    secondary: '#164e63',
    accent: '#06b6d4',
    lightBg: '#ecfeff',
    previewGradient: 'linear-gradient(135deg, #164e63 0%, #0891b2 50%, #0e7490 100%)',
  },
  {
    id: 'amber',
    nameAr: 'الأزرق والبرتقالي الإنشائي',
    nameEn: 'Industrial Amber',
    description: 'طابع المقاولات والسلامة الإنشائية ومواد عزل الفوم والخرسانة',
    primary: '#ea580c',
    secondary: '#1e293b',
    accent: '#f97316',
    lightBg: '#fff7ed',
    previewGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #ea580c 100%)',
  },
  {
    id: 'ruby',
    nameAr: 'الياقوت العنابي',
    nameEn: 'Ruby Burgundy',
    description: 'حضور بصري قوي وفخم، ممتاز لسرعة الاستجابة والعروض التنافسية',
    primary: '#e11d48',
    secondary: '#881337',
    accent: '#f43f5e',
    lightBg: '#fff1f2',
    previewGradient: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #be123c 100%)',
  },
  {
    id: 'midnight',
    nameAr: 'الأزرق النيلي (Midnight)',
    nameEn: 'Midnight Sapphire',
    description: 'طابع تقني مهيب يجمع بين الكحلي النيلي وعمق الهندسة المعمارية',
    primary: '#4f46e5',
    secondary: '#312e81',
    accent: '#6366f1',
    lightBg: '#eef2ff',
    previewGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
  },
  {
    id: 'bronze',
    nameAr: 'البرونزي والصحراوي',
    nameEn: 'Desert Bronze',
    description: 'يعبر عن مقاومة حرارة الشمس الحارقة والعزل الحراري الموفر للكهرباء',
    primary: '#d97706',
    secondary: '#78350f',
    accent: '#eab308',
    lightBg: '#fefce8',
    previewGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #b45309 100%)',
  },
  {
    id: 'charcoal',
    nameAr: 'الرمادي الفحمي البلاتيني',
    nameEn: 'Charcoal Platinum',
    description: 'تصميم حداثي هادئ وبسيط (Minimalist Modern) مع لمسة ذكية متطورة',
    primary: '#0284c7',
    secondary: '#0f172a',
    accent: '#0ea5e9',
    lightBg: '#f8fafc',
    previewGradient: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)',
  },
]

export const DEFAULT_SETTINGS: SiteSettings = {
  logo_url: '',
  favicon_url: '',
  color_scheme: 'ocean',
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
