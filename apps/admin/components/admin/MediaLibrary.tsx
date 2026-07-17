'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import Image from 'next/image'

interface MediaFile {
  name: string
  url: string
}

interface MediaLibraryProps {
  onInsert: (url: string, altText: string) => void
  onClose: () => void
}

export default function MediaLibrary({ onInsert, onClose }: MediaLibraryProps) {
  const [images, setImages] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const uploadRef = useRef<HTMLInputElement>(null)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: listError } = await supabase.storage
      .from('uploads')
      .list('articles', { sortBy: { column: 'created_at', order: 'desc' } })

    if (listError) {
      setError(listError.message)
      setLoading(false)
      return
    }

    const files = (data ?? [])
      .filter(f => f.name !== '.emptyFolderPlaceholder' && f.name !== '')
      .map(f => ({
        name: f.name,
        url: supabase.storage.from('uploads').getPublicUrl(`articles/${f.name}`).data.publicUrl,
      }))

    setImages(files)
    setLoading(false)
  }, [])

  useEffect(() => { fetchImages() }, [fetchImages])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('يُرجى تحديد ملف صورة صالح')
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
    const path = `articles/${Date.now()}.${ext}`

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

  function handleSelect(img: MediaFile) {
    const altText = prompt('أدخل وصف الصورة (مهم للـ SEO)', '') ?? ''
    onInsert(img.url, altText)
    onClose()
  }

  async function handleDelete(img: MediaFile, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`هل تريد حذف هذه الصورة نهائياً؟`)) return
    const supabase = createClient()
    await supabase.storage.from('uploads').remove([`articles/${img.name}`])
    await fetchImages()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">🖼️ مكتبة الصور</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'جاري التحميل...' : `${images.length} صورة في المكتبة`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Upload new button */}
            <label
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl cursor-pointer transition-colors ${
                uploading
                  ? 'bg-blue-50 text-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  جاري الرفع...
                </>
              ) : (
                <>📤 رفع صورة جديدة</>
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
              aria-label="إغلاق"
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
              <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm">جاري تحميل الصور...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <span className="text-6xl">🖼️</span>
              <p className="font-semibold text-gray-600">لا توجد صور في المكتبة بعد</p>
              <p className="text-sm">ارفع صورة جديدة باستخدام الزر أعلاه</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div
                  key={img.name}
                  onClick={() => handleSelect(img)}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-400 cursor-pointer transition-all shadow-sm hover:shadow-lg"
                >
                  <Image
                    src={img.url}
                    alt={img.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/25 transition-colors flex items-end justify-center pb-3">
                    <span className="opacity-0 group-hover:opacity-100 bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-full shadow-md transition-all translate-y-2 group-hover:translate-y-0">
                      ✓ إدراج في المقال
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(img, e)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md"
                    aria-label="حذف الصورة"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            انقر على أي صورة لإدراجها في المقال — سيُطلب منك إدخال وصف الصورة (alt text) للـ SEO
          </p>
        </div>
      </div>
    </div>
  )
}
