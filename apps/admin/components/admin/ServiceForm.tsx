'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import { slugify } from '@saudi-leaks/shared/utils'
import ImageUpload from './ImageUpload'
import type { Service, ServiceInsert } from '@saudi-leaks/shared/types'
import { triggerRevalidation } from '@/lib/revalidate'

interface ServiceFormProps {
  service?: Service
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const isEdit = !!service
  const router = useRouter()

  const [title, setTitle] = useState(service?.title ?? '')
  const [slug, setSlug] = useState(service?.slug ?? '')
  const [description, setDescription] = useState(service?.description ?? '')
  const [metaDescription, setMetaDescription] = useState(service?.meta_description ?? '')
  const [imageUrl, setImageUrl] = useState(service?.image_url ?? '')
  const [sortOrder, setSortOrder] = useState(service?.sort_order ?? 0)
  const [published, setPublished] = useState(service?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(service?.faqs ?? [])

  // Track unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  function markDirty() { setIsDirty(true) }

  function handleTitleChange(val: string) {
    setTitle(val); markDirty()
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const payload: ServiceInsert = {
      title,
      slug,
      description,
      meta_description: metaDescription || null,
      image_url: imageUrl || null,
      sort_order: sortOrder,
      published,
      faqs: faqs.length > 0 ? faqs : null,
    }

    let err
    if (isEdit) {
      const { error: e } = await supabase.from('services').update(payload).eq('id', service.id)
      err = e
    } else {
      const { error: e } = await supabase.from('services').insert(payload)
      err = e
    }

    if (err) { setError(err.message); setLoading(false); return }

    setIsDirty(false)

    // Trigger Vercel ISR cache purge (fire-and-forget via API route)
    triggerRevalidation(['/', '/services', `/services/${slug}`])

    router.push('/admin/services')
    router.refresh()
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Published toggle */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100">
        <div>
          <p className="font-bold text-gray-800">حالة النشر</p>
          <p className="text-xs text-gray-400 mt-0.5">{published ? 'الخدمة ظاهرة على الموقع' : 'الخدمة مخفية (مسودة)'}</p>
        </div>
        <button
          type="button"
          onClick={() => { setPublished(p => !p); markDirty() }}
          className={`relative w-12 h-6 rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${published ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="service-title" className="block text-sm font-bold text-gray-700 mb-2">
          اسم الخدمة <span className="text-red-500">*</span>
        </label>
        <input id="service-title" type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
          required placeholder="مثال: كشف تسربات المياه" className={inputCls} />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="service-slug" className="block text-sm font-bold text-gray-700 mb-2">Slug (رابط الخدمة)</label>
        <input id="service-slug" type="text" value={slug} onChange={e => { setSlug(e.target.value); markDirty() }}
          required dir="ltr" placeholder="service-slug-here"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono text-sm" />
        <p className="text-xs text-gray-400 mt-1">سيتم توليده تلقائياً من الاسم</p>
      </div>

      {/* Sort order + Image row */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="service-sort" className="block text-sm font-bold text-gray-700 mb-2">
            ترتيب العرض <span className="text-gray-400 font-normal">(رقم أقل = يظهر أولاً)</span>
          </label>
          <input id="service-sort" type="number" min={0} value={sortOrder}
            onChange={e => { setSortOrder(Number(e.target.value)); markDirty() }}
            className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">صورة الخدمة</label>
          <ImageUpload bucket="uploads" folder="services" currentUrl={imageUrl}
            onUpload={v => { setImageUrl(v); markDirty() }} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="service-desc" className="block text-sm font-bold text-gray-700 mb-2">
          وصف الخدمة <span className="text-red-500">*</span>
        </label>
        <textarea id="service-desc" value={description}
          onChange={e => { setDescription(e.target.value); markDirty() }}
          required rows={6} placeholder="أدخل وصفاً تفصيلياً للخدمة..."
          className={`${inputCls} resize-y leading-relaxed`} />
      </div>

      {/* SEO */}
      <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-blue-900">⚡ إعدادات SEO</h3>
        <div>
          <label htmlFor="service-meta-desc" className="block text-sm font-bold text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea id="service-meta-desc" value={metaDescription}
            onChange={e => { setMetaDescription(e.target.value); markDirty() }}
            placeholder="وصف الخدمة في محركات البحث (160 حرف)" maxLength={170} rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/170</p>
        </div>
      </div>

      {/* FAQ Editor */}
      <div className="bg-green-50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-green-900">❓ الأسئلة الشائعة (FAQ)</h3>
            <p className="text-xs text-green-600 mt-0.5">تظهر في صفحة الخدمة وفي نتائج البحث كـ Rich Results</p>
          </div>
          <button
            type="button"
            onClick={() => { setFaqs(prev => [...prev, { q: '', a: '' }]); markDirty() }}
            className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            + إضافة سؤال
          </button>
        </div>

        {faqs.length === 0 ? (
          <p className="text-sm text-green-600/70 text-center py-4">لا توجد أسئلة بعد — أضف أسئلة شائعة لتحسين ظهورك في جوجل</p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-green-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg flex-shrink-0">سؤال {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => { setFaqs(prev => prev.filter((_, idx) => idx !== i)); markDirty() }}
                    className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
                  >
                    🗑️ حذف
                  </button>
                </div>
                <input
                  type="text"
                  value={faq.q}
                  onChange={e => {
                    const updated = [...faqs]
                    updated[i] = { ...updated[i], q: e.target.value }
                    setFaqs(updated)
                    markDirty()
                  }}
                  placeholder="مثال: كيف أعرف أن هناك تسرب مياه في منزلي؟"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-bold"
                />
                <textarea
                  value={faq.a}
                  onChange={e => {
                    const updated = [...faqs]
                    updated[i] = { ...updated[i], a: e.target.value }
                    setFaqs(updated)
                    markDirty()
                  }}
                  placeholder="الإجابة التفصيلية..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-y"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button id="service-submit-btn" type="submit" disabled={loading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              جاري الحفظ...
            </>
          ) : isEdit ? '💾 حفظ التعديلات' : '✅ إضافة الخدمة'}
        </button>
        <button type="button" onClick={() => router.push('/admin/services')}
          className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
          إلغاء
        </button>
        {isDirty && <span className="text-xs text-amber-600 font-medium">● تغييرات غير محفوظة</span>}
      </div>
    </form>
  )
}
