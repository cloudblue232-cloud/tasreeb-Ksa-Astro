'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import Image from 'next/image'

export interface MediaFile {
  name: string
  url: string
  folder: string
  created_at?: string | null
  size?: number | null
}

export interface MediaLibraryProps {
  onInsert?: (url: string, altText: string) => void // For rich-text editor
  onSelect?: (url: string) => void                  // For direct main-image selection
  onClose: () => void
  defaultFolder?: string                            // 'all' | 'articles' | 'services'
  title?: string
}

export default function MediaLibrary({
  onInsert,
  onSelect,
  onClose,
  defaultFolder = 'all',
  title,
}: MediaLibraryProps) {
  const [images, setImages] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder)
  const uploadRef = useRef<HTMLInputElement>(null)

  const isSelectMode = !!onSelect

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const foldersToFetch = activeFolder === 'all'
        ? ['articles', 'services']
        : [activeFolder]

      const results = await Promise.all(
        foldersToFetch.map(async (folder) => {
          const { data, error: listError } = await supabase.storage
            .from('uploads')
            .list(folder, { sortBy: { column: 'created_at', order: 'desc' } })

          if (listError) {
            console.warn(`Error listing folder ${folder}:`, listError.message)
            return []
          }

          return (data ?? [])
            .filter((f) => f.name && f.name !== '.emptyFolderPlaceholder' && f.name !== '')
            .map((f) => ({
              name: f.name,
              folder,
              created_at: f.created_at,
              size: f.metadata?.size,
              url: supabase.storage.from('uploads').getPublicUrl(`${folder}/${f.name}`).data.publicUrl,
            }))
        })
      )

      const combined = results.flat().sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
      })

      setImages(combined)
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل مكتبة الصور')
    } finally {
      setLoading(false)
    }
  }, [activeFolder])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('يُرجى تحديد ملف صورة صالح (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
      return
    }

    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()

    // Determine target folder for new upload
    const targetFolder = activeFolder === 'all'
      ? (defaultFolder !== 'all' ? defaultFolder : 'articles')
      : activeFolder

    const path = `${targetFolder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(`فشل الرفع: ${uploadError.message}`)
      setUploading(false)
      return
    }

    if (uploadRef.current) uploadRef.current.value = ''
    setUploading(false)
    await fetchImages()
  }

  function handleImageClick(img: MediaFile) {
    if (onSelect) {
      onSelect(img.url)
      onClose()
    } else if (onInsert) {
      const altText = prompt('أدخل وصف الصورة (مهم للـ SEO ومحركات البحث)', '') ?? ''
      onInsert(img.url, altText)
      onClose()
    }
  }

  async function handleDelete(img: MediaFile, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الصورة "${img.name}" نهائياً من المكتبة؟`)) {
      return
    }
    const supabase = createClient()
    const { error: delError } = await supabase.storage
      .from('uploads')
      .remove([`${img.folder}/${img.name}`])

    if (delError) {
      alert(`فشل حذف الصورة: ${delError.message}`)
      return
    }
    await fetchImages()
  }

  // Filter images by search query
  const filteredImages = images.filter((img) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return img.name.toLowerCase().includes(q) || img.folder.toLowerCase().includes(q)
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                <h2 className="font-bold text-gray-900 text-lg">
                  {title || (isSelectMode ? 'اختيار صورة من المكتبة' : 'مكتبة الصور')}
                </h2>
                {isSelectMode && (
                  <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">
                    تحديد صورة رئيسية
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isSelectMode
                  ? 'انقر على أي صورة لاختيارها كصورة رئيسية دون تكرار الرفع'
                  : 'تصفح الصور المرفوعة أو أضف صورة جديدة للمحتوى'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Upload new image button */}
              <label
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
                  uploading
                    ? 'bg-blue-50 text-blue-400 cursor-not-allowed border border-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    جاري الرفع...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>رفع صورة جديدة</span>
                  </>
                )}
                <input
                  ref={uploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleUpload}
                />
              </label>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق النافذة"
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors text-base"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Folder tabs & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Folder Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveFolder('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFolder === 'all'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 جميع الصور ({images.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFolder('articles')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFolder === 'articles'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📝 المقالات
              </button>
              <button
                type="button"
                onClick={() => setActiveFolder('services')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeFolder === 'services'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🛠️ الخدمات
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الصور بالاسم..."
                className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
              <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-sm font-semibold text-gray-600">جاري تحميل مكتبة الصور...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3 text-center">
              <span className="text-5xl">🖼️</span>
              <p className="font-semibold text-gray-700 text-base">
                {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد صور في هذا القسم بعد'}
              </p>
              <p className="text-xs text-gray-500 max-w-sm">
                {searchQuery
                  ? 'جرب البحث بكلمة أخرى أو مسح حقل البحث'
                  : 'يمكنك رفع صورة جديدة باستخدام زر "رفع صورة جديدة" أعلاه لتظهر هنا.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredImages.map((img) => (
                <div
                  key={`${img.folder}-${img.name}`}
                  onClick={() => handleImageClick(img)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleImageClick(img)
                    }
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-500 bg-white cursor-pointer transition-all shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />

                  {/* Folder Tag */}
                  <div className="absolute top-2 right-2 z-10">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${
                        img.folder === 'articles'
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {img.folder === 'articles' ? 'مقال' : 'خدمة'}
                    </span>
                  </div>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-3 text-center">
                    <span className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-full shadow-md transition-transform translate-y-2 group-hover:translate-y-0">
                      {isSelectMode ? '✓ اختيار كصورة رئيسية' : '✓ إدراج في المحتوى'}
                    </span>
                    <span className="text-[10px] text-white/90 truncate max-w-full mt-1.5 dir-ltr font-mono">
                      {img.name}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(img, e)}
                    className="absolute top-2 left-2 w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md z-20"
                    title="حذف الصورة من المكتبة"
                    aria-label="حذف الصورة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex-shrink-0 flex items-center justify-between text-xs text-gray-500">
          <span>
            {isSelectMode
              ? '💡 انقر على أي صورة لتحديدها مباشرة كصورة رئيسية.'
              : '💡 انقر على الصورة لإدراجها في المقال أو الخدمة مع وصف SEO.'}
          </span>
          <span className="font-semibold text-gray-400">
            {filteredImages.length} صورة
          </span>
        </div>
      </div>
    </div>
  )
}
