'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import { slugify } from '@saudi-leaks/shared/utils'
import ImageUpload from './ImageUpload'
import type { Article, ArticleInsert } from '@saudi-leaks/shared/types'
import { revalidateAstroPaths } from '@/app/actions/revalidate'

interface ArticleFormProps {
  article?: Article
}

// Simple rich-text toolbar actions
const TOOLBAR_ACTIONS = [
  { label: 'H1', tag: 'h1', title: 'عنوان رئيسي كبير' },
  { label: 'H2', tag: 'h2', title: 'عنوان رئيسي' },
  { label: 'H3', tag: 'h3', title: 'عنوان فرعي' },
  { label: 'P', tag: 'p', title: 'فقرة' },
  { label: 'B', tag: 'strong', title: 'عريض' },
  { label: 'UL', tag: 'ul-li', title: 'قائمة' },
  { label: 'Link', tag: 'a', title: 'رابط (مع عنوان)' },
]

export default function ArticleForm({ article }: ArticleFormProps) {
  const isEdit = !!article
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [title, setTitle] = useState(article?.title ?? '')
  const [slug, setSlug] = useState(article?.slug ?? '')
  const [content, setContent] = useState(article?.content ?? '')
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? '')
  const [metaTitle, setMetaTitle] = useState(article?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(article?.meta_description ?? '')
  const [published, setPublished] = useState(article?.published ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Unsaved changes warning
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

  // Insert HTML tag wrapper at cursor position in textarea
function insertTag(tag: string) {
  const ta = textareaRef.current
  if (!ta) return

  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = content.slice(start, end)

  let snippet = ''

  if (tag === 'a') {
    const url = prompt('أدخل الرابط', 'https://')

    if (!url) return

    snippet = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline" >${selected || 'رابط'}</a>`
  } else if (tag === 'ul-li') {
    snippet = `<ul>\n  <li>${selected || 'عنصر القائمة'}</li>\n</ul>`
  } else {
    snippet = `<${tag}>${selected || `نص ${tag}`}</${tag}>`
  }

  const newContent =
    content.slice(0, start) +
    snippet +
    content.slice(end)

  setContent(newContent)
  markDirty()

  setTimeout(() => {
    ta.focus()
    ta.setSelectionRange(
      start + snippet.length,
      start + snippet.length
    )
  }, 0)
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const payload: ArticleInsert = {
      title, slug, content,
      image_url: imageUrl || null,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      published,
    }

    let err
    if (isEdit) {
      const { error: e } = await supabase.from('articles').update(payload).eq('id', article.id)
      err = e
    } else {
      const { error: e } = await supabase.from('articles').insert(payload)
      err = e
    }

    if (err) { setError(err.message); setLoading(false); return }
    setIsDirty(false)

    // Trigger Vercel ISR Revalidation for public site
    await revalidateAstroPaths(['/', '/articles', `/articles/${slug}`])

    router.push('/admin/articles')
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
          <p className="text-xs text-gray-400 mt-0.5">{published ? 'المقال منشور على الموقع' : 'المقال مخفي (مسودة)'}</p>
        </div>
        <button type="button" onClick={() => { setPublished(p => !p); markDirty() }}
          className={`relative w-12 h-6 rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${published ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="article-title" className="block text-sm font-bold text-gray-700 mb-2">
          عنوان المقال <span className="text-red-500">*</span>
        </label>
        <input id="article-title" type="text" value={title} onChange={e => handleTitleChange(e.target.value)}
          required placeholder="أدخل عنوان المقال..." className={inputCls} />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="article-slug" className="block text-sm font-bold text-gray-700 mb-2">Slug (رابط المقال)</label>
        <input id="article-slug" type="text" value={slug} onChange={e => { setSlug(e.target.value); markDirty() }}
          required dir="ltr" placeholder="article-slug-here"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono text-sm" />
        <p className="text-xs text-gray-400 mt-1">سيتم توليده تلقائياً من العنوان</p>
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">صورة المقال</label>
        <ImageUpload bucket="uploads" folder="articles" currentUrl={imageUrl}
          onUpload={v => { setImageUrl(v); markDirty() }} />
      </div>

      {/* Rich-text editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700">
            محتوى المقال <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button type="button" onClick={() => setActiveTab('edit')}
              className={`px-3 py-1.5 font-semibold transition-colors ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              ✏️ تحرير
            </button>
            <button type="button" onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 font-semibold transition-colors ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              👁️ معاينة
            </button>
          </div>
        </div>

        {activeTab === 'edit' ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 border border-gray-200 rounded-t-xl">
              {TOOLBAR_ACTIONS.map(action => (
                <button key={action.tag} type="button" title={action.title}
                  onClick={() => insertTag(action.tag)}
                  className="px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors">
                  {action.label}
                </button>
              ))}
              <span className="mr-auto text-xs text-gray-400 self-center">
                {content.length} حرف
              </span>
            </div>
            <textarea ref={textareaRef} id="article-content" value={content}
              onChange={e => { setContent(e.target.value); markDirty() }}
              required rows={18}
              placeholder={'<h2>عنوان فرعي</h2>\n<p>محتوى المقال...</p>'}
              className="w-full px-4 py-3 rounded-b-xl border border-t-0 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y leading-relaxed"
              dir="auto" />
            <p className="text-xs text-gray-400 mt-1">يدعم: h2, h3, p, ul, li, strong — استخدم أزرار الأدوات أعلاه</p>
          </>
        ) : (
          <div
            className="prose-arabic min-h-72 bg-white border border-gray-200 rounded-xl p-6"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">لا يوجد محتوى للمعاينة بعد...</p>' }}
          />
        )}
      </div>

      {/* SEO */}
      <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-blue-900">⚡ إعدادات SEO</h3>
        <div>
          <label htmlFor="article-meta-title" className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
          <input id="article-meta-title" type="text" value={metaTitle}
            onChange={e => { setMetaTitle(e.target.value); markDirty() }}
            placeholder="عنوان الصفحة في محركات البحث (60 حرف)" maxLength={70}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/70</p>
        </div>
        <div>
          <label htmlFor="article-meta-desc" className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
          <textarea id="article-meta-desc" value={metaDescription}
            onChange={e => { setMetaDescription(e.target.value); markDirty() }}
            placeholder="وصف الصفحة في محركات البحث (160 حرف)" maxLength={170} rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/170</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button id="article-submit-btn" type="submit" disabled={loading}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              جاري الحفظ...
            </>
          ) : isEdit ? '💾 حفظ التعديلات' : published ? '✅ نشر المقال' : '💾 حفظ كمسودة'}
        </button>
        <button type="button" onClick={() => router.push('/admin/articles')}
          className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
          إلغاء
        </button>
        {isDirty && <span className="text-xs text-amber-600 font-medium">● تغييرات غير محفوظة</span>}
      </div>
    </form>
  )
}
