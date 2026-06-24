'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import type { SiteSettings } from '@saudi-leaks/shared/types'
import { triggerRevalidation } from '@/lib/revalidate'

const FIELDS: { key: keyof SiteSettings; label: string; hint: string; type?: string; dir?: string }[] = [
  {
    key: 'site_title',
    label: 'عنوان الموقع',
    hint: 'يظهر في تبويب المتصفح وبطاقات المشاركة الاجتماعية',
  },
  {
    key: 'site_description',
    label: 'وصف الموقع',
    hint: 'يظهر في نتائج البحث Google (Meta Description)',
  },
  {
    key: 'phone',
    label: 'رقم الهاتف',
    hint: 'مثال: +966501234567 — يظهر في الترويسة والتذييل',
    dir: 'ltr',
  },
  {
    key: 'whatsapp',
    label: 'رقم واتساب',
    hint: 'بدون + أو 00 — مثال: 966501234567',
    dir: 'ltr',
  },
  {
    key: 'google_ads_id',
    label: 'Google Ads ID',
    hint: 'مثال: AW-1234567890 — اتركه فارغاً لتعطيل الإعلانات',
    dir: 'ltr',
    type: 'text',
  },
]

export default function SettingsForm() {
  const [values, setValues] = useState<SiteSettings>({
    site_title: '',
    site_description: '',
    phone: '',
    whatsapp: '',
    google_ads_id: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load current settings on mount
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) {
        const map = Object.fromEntries(data.map(r => [r.key, r.value]))
        setValues(prev => ({ ...prev, ...map }))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const rows = Object.entries(values).map(([key, value]) => ({ key, value: value ?? '' }))

    const { error: err } = await supabase
      .from('site_settings')
      .upsert(rows, { onConflict: 'key' })

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      
      // Trigger Vercel ISR cache purge (fire-and-forget via API route)
      triggerRevalidation(['/', '/articles', '/services'])

      setTimeout(() => setSuccess(false), 4000)
    }
    setSaving(false)
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all bg-white'

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {FIELDS.map(f => (
          <div key={f.key}>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-12 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          ✅ تم حفظ الإعدادات بنجاح — ستظهر التغييرات على الموقع فوراً
        </div>
      )}

      {FIELDS.map(field => (
        <div key={field.key}>
          <label
            htmlFor={`setting-${field.key}`}
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            {field.label}
          </label>
          {field.key === 'site_description' ? (
            <textarea
              id={`setting-${field.key}`}
              value={values[field.key]}
              onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              rows={3}
              className={`${inputCls} resize-none`}
            />
          ) : (
            <input
              id={`setting-${field.key}`}
              type={field.type ?? 'text'}
              value={values[field.key]}
              onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              dir={field.dir}
              className={inputCls}
            />
          )}
          <p className="text-xs text-gray-400 mt-1">{field.hint}</p>
        </div>
      ))}

      {/* Google Ads preview */}
      {values.google_ads_id && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 font-mono" dir="ltr">
          {'<script async src="https://www.googletagmanager.com/gtag/js?id='}{values.google_ads_id}{'"></script>'}
          <p className="mt-1 font-sans font-semibold text-blue-600">✅ سيتم حقن هذا السكريبت تلقائياً في جميع صفحات الموقع</p>
        </div>
      )}

      <div className="pt-2">
        <button
          id="settings-save-btn"
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              جاري الحفظ...
            </>
          ) : '💾 حفظ الإعدادات'}
        </button>
      </div>
    </form>
  )
}
