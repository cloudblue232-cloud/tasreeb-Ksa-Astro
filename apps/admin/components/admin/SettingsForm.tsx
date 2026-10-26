'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import type { SiteSettings, CustomSocialLink, ColorSchemeId } from '@saudi-leaks/shared/types'
import { DEFAULT_SETTINGS, COLOR_SCHEMES } from '@saudi-leaks/shared/types'
import { triggerRevalidation } from '@/lib/revalidate'
import ImageUpload from './ImageUpload'

type SettingsTab = 'brand' | 'seo' | 'contact' | 'social' | 'pixels' | 'custom'

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'brand', label: 'الهوية والمظهر', icon: '🎨' },
  { id: 'seo', label: 'المعلومات العامة و SEO', icon: '🌐' },
  { id: 'contact', label: 'بيانات التواصل والمقر', icon: '📞' },
  { id: 'social', label: 'شبكات التواصل', icon: '📱' },
  { id: 'pixels', label: 'التتبع والإعلانات', icon: '📊' },
  { id: 'custom', label: 'أكواد مخصصة', icon: '💻' },
]

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('brand')
  const [values, setValues] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [customSocials, setCustomSocials] = useState<CustomSocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Load current settings on mount
  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data, error: fetchErr } = await supabase.from('site_settings').select('key, value')
        if (fetchErr) {
          setError(fetchErr.message)
        } else if (data) {
          const map = Object.fromEntries(data.map((r) => [r.key, r.value]))
          setValues((prev) => ({
            ...prev,
            ...map,
          }))

          if (map['custom_social_links']) {
            try {
              setCustomSocials(JSON.parse(map['custom_social_links']))
            } catch {
              setCustomSocials([])
            }
          }
        }
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل الإعدادات')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleChange(key: keyof SiteSettings, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }))
    setIsDirty(true)
  }

  function handleAddCustomSocial() {
    const newItem: CustomSocialLink = {
      id: String(Date.now()),
      name: '',
      url: '',
      icon: '🔗',
    }
    const updated = [...customSocials, newItem]
    setCustomSocials(updated)
    handleChange('custom_social_links', JSON.stringify(updated))
  }

  function handleUpdateCustomSocial(id: string, field: keyof CustomSocialLink, val: string) {
    const updated = customSocials.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    )
    setCustomSocials(updated)
    handleChange('custom_social_links', JSON.stringify(updated))
  }

  function handleDeleteCustomSocial(id: string) {
    const updated = customSocials.filter((item) => item.id !== id)
    setCustomSocials(updated)
    handleChange('custom_social_links', JSON.stringify(updated))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const rows = Object.entries(values).map(([key, value]) => ({
        key,
        value: value ?? '',
      }))

      const { error: err } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' })

      if (err) {
        setError(err.message)
      } else {
        setSuccess(true)
        setIsDirty(false)

        // Trigger Vercel ISR cache purge for static pages
        triggerRevalidation(['/', '/articles', '/services', '/contact'])

        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-white'

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-10 bg-gray-200 rounded-xl w-3/4 mb-6" />
        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>تم حفظ الإعدادات بنجاح وتحديث الموقع فورياً!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ================= TAB 1: BRAND & LOGO ================= */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
            💡 يمكنك رفع الشعار والأيقونة من جهازك أو اختيارهما مباشرة من <strong>مكتبة الصور</strong> المرفوعة مسبقاً لمنع التكرار.
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Site Logo */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                شعار الموقع (Logo)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                يظهر في الترويسة (Header) والتذييل (Footer). يُفضل صيغة PNG أو WEBP بخلفية شفافة.
              </p>
              <ImageUpload
                bucket="uploads"
                folder="general"
                currentUrl={values.logo_url}
                onUpload={(url) => handleChange('logo_url', url)}
              />
            </div>

            {/* Site Favicon */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                أيقونة الموقع (Favicon)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                تظهر في تبويب المتصفح وبجانب عنوان الصفحة في نتائج بحث الموبايل (مربعة الشكل).
              </p>
              <ImageUpload
                bucket="uploads"
                folder="general"
                currentUrl={values.favicon_url}
                onUpload={(url) => handleChange('favicon_url', url)}
              />
            </div>
          </div>

          {/* ================= COLOR SCHEMES ================= */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>🎨</span> نسق ألوان وهوية الموقع (Color Scheme)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  اختر هوية الألوان المناسبة لموقعك. يتغير الموقع بالكامل (الترويسة، الفوتر، الأزرار، التدرجات، والبطاقات) تلقائياً ليتوافق مع السمة المختارة.
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {COLOR_SCHEMES.length} سمات متاحة
              </span>
            </div>

            {/* Grid of 9 Themes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {COLOR_SCHEMES.map((scheme) => {
                const isSelected = (values.color_scheme || 'ocean') === scheme.id
                return (
                  <div
                    key={scheme.id}
                    onClick={() => handleChange('color_scheme', scheme.id)}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    {/* Header: Name + Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {scheme.nameAr}
                          </h4>
                          <span className="text-[11px] text-gray-400 font-mono">{scheme.nameEn}</span>
                        </div>
                        {isSelected ? (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-sm font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs hover:border-gray-400" />
                        )}
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                        {scheme.description}
                      </p>
                    </div>

                    {/* Mini Live Preview Mockup */}
                    <div className="rounded-xl overflow-hidden border border-gray-200/80 shadow-xs mb-3 text-[10px]">
                      {/* Mini Header */}
                      <div className="px-2.5 py-1.5 bg-white border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: scheme.primary }} />
                          <div className="w-10 h-1.5 rounded-full bg-gray-200" />
                        </div>
                        <div className="px-1.5 py-0.5 rounded text-white font-bold text-[9px]" style={{ backgroundColor: scheme.primary }}>
                          اتصال
                        </div>
                      </div>

                      {/* Mini Hero Gradient */}
                      <div className="p-3 text-white flex flex-col justify-between min-h-[64px]" style={{ background: scheme.previewGradient }}>
                        <div>
                          <div className="w-16 h-2 rounded bg-white/80 mb-1" />
                          <div className="w-24 h-1.5 rounded bg-white/50" />
                        </div>
                        <div className="flex items-center gap-1.5 pt-2">
                          <div className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs" style={{ backgroundColor: scheme.primary }}>
                            زر رئيسي
                          </div>
                          <div className="w-3 h-3 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: scheme.accent }}>
                            <span className="text-[8px]">★</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Palette Swatches */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 text-xs">
                      <span className="text-[11px] text-gray-400 font-medium">الألوان:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: scheme.primary }}
                          title={`الأساسي: ${scheme.primary}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: scheme.secondary }}
                          title={`الداكن: ${scheme.secondary}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: scheme.accent }}
                          title={`التمييز: ${scheme.accent}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: scheme.lightBg }}
                          title={`الخلفية الفاتحة: ${scheme.lightBg}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: GENERAL & SEO ================= */}
      {activeTab === 'seo' && (
        <div className="space-y-5">
          {/* Site Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="setting-site_title" className="text-sm font-bold text-gray-800">
                عنوان الموقع (Title Tag) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-mono">{values.site_title.length} / 60 حرف</span>
            </div>
            <input
              id="setting-site_title"
              type="text"
              value={values.site_title}
              onChange={(e) => handleChange('site_title', e.target.value)}
              placeholder="مثال: شركة كشف تسربات المياه والعزل المعتمدة بالسعودية"
              className={inputCls}
              required
            />
            <p className="text-xs text-gray-400 mt-1">يظهر كعنوان رئيسي في تبويب المتصفح ونتائج بحث Google.</p>
          </div>

          {/* Site Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="setting-site_description" className="text-sm font-bold text-gray-800">
                وصف الموقع (Meta Description) <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-mono">{values.site_description.length} / 160 حرف</span>
            </div>
            <textarea
              id="setting-site_description"
              rows={3}
              value={values.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="وصف مختصر وجذاب يظهر تحت عنوان موقعك في نتائج بحث Google ومشاركات السوشيال ميديا..."
              className={inputCls}
              required
            />
          </div>

          {/* Site Keywords */}
          <div>
            <label htmlFor="setting-site_keywords" className="block text-sm font-bold text-gray-800 mb-1.5">
              الكلمات المفتاحية (Meta Keywords)
            </label>
            <textarea
              id="setting-site_keywords"
              rows={3}
              value={values.site_keywords}
              onChange={(e) => handleChange('site_keywords', e.target.value)}
              placeholder="كشف تسربات المياه, عزل اسطح بالرياض, شركة عزل فوم, عزل خزانات مياه, كشف تسربات بدون تكسير"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              افصل بين كل كلمة مفتاحية والأخرى بفاصلة (,). تُحقن تلقائياً في وسم <code>&lt;meta name="keywords"&gt;</code>.
            </p>
          </div>

          {/* Google Search Console Verification */}
          <div>
            <label htmlFor="setting-google_search_console_id" className="block text-sm font-bold text-gray-800 mb-1.5">
              كود التحقق من Google Search Console
            </label>
            <input
              id="setting-google_search_console_id"
              type="text"
              dir="ltr"
              value={values.google_search_console_id}
              onChange={(e) => handleChange('google_search_console_id', e.target.value)}
              placeholder="p1Pr6RMWOa4n1k3PPqxTbfzqsgTM1xUgQ9SHlRJdYho"
              className={`${inputCls} font-mono text-left`}
            />
            <p className="text-xs text-gray-400 mt-1">
              أدخل قيمة <code>content</code> فقط من وسم التحقق <code>&lt;meta name="google-site-verification"&gt;</code>.
            </p>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONTACT & LOCATION ================= */}
      {activeTab === 'contact' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            {/* Phone Primary */}
            <div>
              <label htmlFor="setting-phone" className="block text-sm font-bold text-gray-800 mb-1.5">
                رقم الهاتف الأول (الأساسي) <span className="text-red-500">*</span>
              </label>
              <input
                id="setting-phone"
                type="text"
                dir="ltr"
                value={values.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+966536207027"
                className={`${inputCls} font-mono text-left`}
                required
              />
              <p className="text-xs text-gray-400 mt-1">يظهر في خط التواصل الأول والترويسة والاتصال المباشر.</p>
            </div>

            {/* Phone Secondary */}
            <div>
              <label htmlFor="setting-phone_secondary" className="block text-sm font-bold text-gray-800 mb-1.5">
                رقم الهاتف الثاني (الإضافي)
              </label>
              <input
                id="setting-phone_secondary"
                type="text"
                dir="ltr"
                value={values.phone_secondary}
                onChange={(e) => handleChange('phone_secondary', e.target.value)}
                placeholder="+966530955302"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">يظهر في بطاقة خط التواصل الثاني في صفحة تواصل معنا.</p>
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="setting-whatsapp" className="block text-sm font-bold text-gray-800 mb-1.5">
                رقم الواتساب <span className="text-red-500">*</span>
              </label>
              <input
                id="setting-whatsapp"
                type="text"
                dir="ltr"
                value={values.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="966536207027"
                className={`${inputCls} font-mono text-left`}
                required
              />
              <p className="text-xs text-gray-400 mt-1">مع كود الدولة وبدون + أو أصفار (للزر العائم والمحادثات).</p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="setting-email" className="block text-sm font-bold text-gray-800 mb-1.5">
              البريد الإلكتروني الرسمي
            </label>
            <input
              id="setting-email"
              type="email"
              dir="ltr"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="info@example.com"
              className={`${inputCls} text-left`}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Address */}
            <div>
              <label htmlFor="setting-address" className="block text-sm font-bold text-gray-800 mb-1.5">
                المدينة / المقر الجغرافي
              </label>
              <input
                id="setting-address"
                type="text"
                value={values.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="الرياض، المملكة العربية السعودية"
                className={inputCls}
              />
              <p className="text-xs text-gray-400 mt-1">يُستخدم في وسم النطاق الجغرافي Geo-tagging ومحركات البحث.</p>
            </div>

            {/* Working Hours */}
            <div>
              <label htmlFor="setting-working_hours" className="block text-sm font-bold text-gray-800 mb-1.5">
                ساعات وأوقات العمل
              </label>
              <input
                id="setting-working_hours"
                type="text"
                value={values.working_hours}
                onChange={(e) => handleChange('working_hours', e.target.value)}
                placeholder="على مدار 24 ساعة — 7 أيام في الأسبوع"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SOCIAL LINKS ================= */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 mb-2">
            اترك الحقل فارغاً لأي شبكة اجتماعية لا ترغب في ظهورها في تذييل وصفحة تواصل الموقع.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="setting-twitter_url" className="block text-xs font-bold text-gray-700 mb-1">
                𝕏 منصة إكس (تويتر)
              </label>
              <input
                id="setting-twitter_url"
                type="url"
                dir="ltr"
                value={values.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://x.com/username"
                className={`${inputCls} text-left text-xs`}
              />
            </div>

            <div>
              <label htmlFor="setting-instagram_url" className="block text-xs font-bold text-gray-700 mb-1">
                📸 إنستغرام (Instagram)
              </label>
              <input
                id="setting-instagram_url"
                type="url"
                dir="ltr"
                value={values.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/username"
                className={`${inputCls} text-left text-xs`}
              />
            </div>

            <div>
              <label htmlFor="setting-snapchat_url" className="block text-xs font-bold text-gray-700 mb-1">
                👻 سناب شات (Snapchat)
              </label>
              <input
                id="setting-snapchat_url"
                type="url"
                dir="ltr"
                value={values.snapchat_url}
                onChange={(e) => handleChange('snapchat_url', e.target.value)}
                placeholder="https://snapchat.com/add/username"
                className={`${inputCls} text-left text-xs`}
              />
            </div>

            <div>
              <label htmlFor="setting-tiktok_url" className="block text-xs font-bold text-gray-700 mb-1">
                🎵 تيك توك (TikTok)
              </label>
              <input
                id="setting-tiktok_url"
                type="url"
                dir="ltr"
                value={values.tiktok_url}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@username"
                className={`${inputCls} text-left text-xs`}
              />
            </div>

            <div>
              <label htmlFor="setting-facebook_url" className="block text-xs font-bold text-gray-700 mb-1">
                👤 فيسبوك (Facebook)
              </label>
              <input
                id="setting-facebook_url"
                type="url"
                dir="ltr"
                value={values.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/pagename"
                className={`${inputCls} text-left text-xs`}
              />
            </div>

            <div>
              <label htmlFor="setting-youtube_url" className="block text-xs font-bold text-gray-700 mb-1">
                ▶️ يوتيوب (YouTube)
              </label>
              <input
                id="setting-youtube_url"
                type="url"
                dir="ltr"
                value={values.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@channel"
                className={`${inputCls} text-left text-xs`}
              />
            </div>
          </div>

          {/* Custom Social Platforms */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-800">
                  منصات وحسابات إضافية مخصصة
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  أضف أي منصات أخرى لا توجد أعلاه (مثل: معروف Maroof، تيليجرام Telegram، لينكد إن LinkedIn، حراج، ثريدز Threads، إلخ).
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomSocial}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors self-start sm:self-auto"
              >
                <span>➕</span>
                <span>إضافة منصة مخصصة</span>
              </button>
            </div>

            {customSocials.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-5 text-center text-xs text-gray-400">
                لا توجد منصات إضافية مضافة بعد. اضغط على زر "إضافة منصة مخصصة" لإضافة منصات وروابط غير محدودة.
              </div>
            ) : (
              <div className="space-y-3">
                {customSocials.map((cs) => (
                  <div
                    key={cs.id}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    {/* Icon / Emoji */}
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        الرمز
                      </label>
                      <input
                        type="text"
                        value={cs.icon || '🔗'}
                        onChange={(e) => handleUpdateCustomSocial(cs.id, 'icon', e.target.value)}
                        placeholder="🔗"
                        maxLength={4}
                        className="w-full px-2 py-2 text-center rounded-lg border border-gray-200 bg-white text-sm"
                      />
                    </div>

                    {/* Platform Name */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        اسم المنصة
                      </label>
                      <input
                        type="text"
                        value={cs.name}
                        onChange={(e) => handleUpdateCustomSocial(cs.id, 'name', e.target.value)}
                        placeholder="مثال: معروف (Maroof) أو تيليجرام"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs"
                      />
                    </div>

                    {/* URL */}
                    <div className="flex-1 sm:flex-[2]">
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">
                        رابط الحساب (URL)
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={cs.url}
                        onChange={(e) => handleUpdateCustomSocial(cs.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs font-mono text-left"
                      />
                    </div>

                    {/* Delete button */}
                    <div className="sm:self-end mb-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomSocial(cs.id)}
                        className="px-2.5 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                        title="حذف المنصة"
                      >
                        <span>✕</span>
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: ANALYTICS & PIXELS ================= */}
      {activeTab === 'pixels' && (
        <div className="space-y-5">
          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            📢 <strong>تثبيت سهل ومباشر:</strong> أدخل فقط معرّف التتبع (ID) وسيتم حقن السكربت الرسمي تلقائياً دون الحاجة لكتابة كود. اترك الحقل فارغاً لتعطيله.
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Google Ads */}
            <div>
              <label htmlFor="setting-google_ads_id" className="block text-sm font-bold text-gray-800 mb-1">
                Google Ads ID
              </label>
              <input
                id="setting-google_ads_id"
                type="text"
                dir="ltr"
                value={values.google_ads_id}
                onChange={(e) => handleChange('google_ads_id', e.target.value)}
                placeholder="AW-18515270711"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">معرّف حساب إعلانات جوجل لتتبع النقرات والتحويلات.</p>
            </div>

            {/* Google Analytics 4 */}
            <div>
              <label htmlFor="setting-google_analytics_id" className="block text-sm font-bold text-gray-800 mb-1">
                Google Analytics 4 (GA4)
              </label>
              <input
                id="setting-google_analytics_id"
                type="text"
                dir="ltr"
                value={values.google_analytics_id}
                onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">معرّف قياس إحصائيات زوار الموقع.</p>
            </div>

            {/* Google Tag Manager */}
            <div>
              <label htmlFor="setting-google_tag_manager_id" className="block text-sm font-bold text-gray-800 mb-1">
                Google Tag Manager (GTM)
              </label>
              <input
                id="setting-google_tag_manager_id"
                type="text"
                dir="ltr"
                value={values.google_tag_manager_id}
                onChange={(e) => handleChange('google_tag_manager_id', e.target.value)}
                placeholder="GTM-XXXXXXX"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">حاوية إدارة العلامات الشاملة من جوجل.</p>
            </div>

            {/* Snapchat Pixel */}
            <div>
              <label htmlFor="setting-snapchat_pixel_id" className="block text-sm font-bold text-gray-800 mb-1">
                👻 Snapchat Pixel ID
              </label>
              <input
                id="setting-snapchat_pixel_id"
                type="text"
                dir="ltr"
                value={values.snapchat_pixel_id}
                onChange={(e) => handleChange('snapchat_pixel_id', e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">بكسل تتبع إعلانات سناب شات في السعودية.</p>
            </div>

            {/* TikTok Pixel */}
            <div>
              <label htmlFor="setting-tiktok_pixel_id" className="block text-sm font-bold text-gray-800 mb-1">
                🎵 TikTok Pixel ID
              </label>
              <input
                id="setting-tiktok_pixel_id"
                type="text"
                dir="ltr"
                value={values.tiktok_pixel_id}
                onChange={(e) => handleChange('tiktok_pixel_id', e.target.value)}
                placeholder="CXXXXXXXXXXXXXXXXX"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">بكسل تتبع إعلانات تيك توك.</p>
            </div>

            {/* Meta Pixel */}
            <div>
              <label htmlFor="setting-meta_pixel_id" className="block text-sm font-bold text-gray-800 mb-1">
                📸 Meta / Facebook Pixel ID
              </label>
              <input
                id="setting-meta_pixel_id"
                type="text"
                dir="ltr"
                value={values.meta_pixel_id}
                onChange={(e) => handleChange('meta_pixel_id', e.target.value)}
                placeholder="123456789012345"
                className={`${inputCls} font-mono text-left`}
              />
              <p className="text-xs text-gray-400 mt-1">بكسل تتبع إعلانات فيسبوك وانستغرام.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: CUSTOM SCRIPTS ================= */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
            ⚡ <strong>صندوق الأكواد الحرة:</strong> هنا يمكنك لصق أي وسم مخصص مثل أكواد التحويل لـ Google Ads، أكواد الخرائط الحرارية (Microsoft Clarity / Hotjar)، أو تطبيقات الدردشة الفورية. يتم إدراج الكود في كل صفحات الموقع تلقائياً.
          </div>

          {/* Custom Head Scripts */}
          <div>
            <label htmlFor="setting-custom_head_code" className="block text-sm font-bold text-gray-800 mb-1.5">
              أكواد الترويسة (Header Scripts inside &lt;head&gt;)
            </label>
            <textarea
              id="setting-custom_head_code"
              rows={6}
              dir="ltr"
              value={values.custom_head_code}
              onChange={(e) => handleChange('custom_head_code', e.target.value)}
              placeholder={'<!-- Paste your <script> or <meta> tags here -->\n<script>\n  // Custom tracking code...\n</script>'}
              className={`${inputCls} font-mono text-xs leading-relaxed text-left`}
            />
            <p className="text-xs text-gray-400 mt-1">
              يُحقن الكود مباشرة قبل إغلاق وسم <code>&lt;/head&gt;</code>.
            </p>
          </div>

          {/* Custom Body Scripts */}
          <div>
            <label htmlFor="setting-custom_body_code" className="block text-sm font-bold text-gray-800 mb-1.5">
              أكواد التذييل ونهاية الصفحة (Footer Scripts before &lt;/body&gt;)
            </label>
            <textarea
              id="setting-custom_body_code"
              rows={6}
              dir="ltr"
              value={values.custom_body_code}
              onChange={(e) => handleChange('custom_body_code', e.target.value)}
              placeholder={'<!-- Chat widgets, noscript tags, or footer scripts -->\n<script>\n  // Live chat widget snippet...\n</script>'}
              className={`${inputCls} font-mono text-xs leading-relaxed text-left`}
            />
            <p className="text-xs text-gray-400 mt-1">
              يُحقن الكود مباشرة قبل إغلاق وسم <code>&lt;/body&gt;</code>.
            </p>
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          id="settings-save-btn"
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span>جاري حفظ الإعدادات...</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>حفظ جميع الإعدادات</span>
            </>
          )}
        </button>

        {isDirty && (
          <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
            <span>●</span> لديك تعديلات غير محفوظة
          </span>
        )}
      </div>
    </form>
  )
}
