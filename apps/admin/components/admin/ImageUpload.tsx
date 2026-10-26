'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@saudi-leaks/shared/supabase/client'
import MediaLibrary from './MediaLibrary'

interface ImageUploadProps {
  bucket?: string
  folder?: string
  currentUrl: string
  onUpload: (url: string) => void
  label?: string
}

export default function ImageUpload({
  bucket = 'uploads',
  folder = 'articles',
  currentUrl,
  onUpload,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
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
    const path = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError(`فشل رفع الصورة: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)

    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove() {
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          ⚠️ {error}
        </p>
      )}

      {/* Hidden file input for device upload */}
      <input
        ref={inputRef}
        id={`image-upload-input-${folder}`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      {/* Preview if image is already selected */}
      {currentUrl ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-3">
          <div className="relative w-full h-56 rounded-lg overflow-hidden border border-gray-200 bg-black/5">
            <Image
              src={currentUrl}
              alt="صورة تم اختيارها"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              unoptimized
            />
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              ✓ الصورة الحالية
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span>🖼️</span>
              <span>تغيير من مكتبة الصور</span>
            </button>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <span>{uploading ? '⏳' : '📤'}</span>
              <span>{uploading ? 'جاري الرفع...' : 'رفع صورة بديلة'}</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors mr-auto"
            >
              <span>✕</span>
              <span>إزالة الصورة</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dual Choice: Pick from Library OR Upload from device */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Choice 1: Pick from Media Library */}
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-xl transition-all group text-center cursor-pointer shadow-sm hover:shadow"
          >
            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2.5 group-hover:scale-110 transition-transform">
              <span className="text-xl">🖼️</span>
            </div>
            <span className="text-sm font-bold text-blue-900 mb-1">
              اختيار من مكتبة الصور
            </span>
            <span className="text-xs text-blue-600/80">
              تصفح الصور المرفوعة مسبقاً لمنع التكرار
            </span>
          </button>

          {/* Choice 2: Upload new from device */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-all group text-center shadow-sm ${
              uploading
                ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                : 'border-gray-300 bg-gray-50/70 hover:border-blue-400 hover:bg-gray-100/70 cursor-pointer hover:shadow'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-xs font-bold">جاري رفع الصورة...</span>
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-600 mb-2.5 group-hover:scale-110 transition-transform">
                  <span className="text-xl">📤</span>
                </div>
                <span className="text-sm font-bold text-gray-800 mb-1">
                  رفع صورة جديدة من جهازك
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, WEBP — حتى 5MB
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual URL input */}
      <div>
        <label
          htmlFor={`image-url-manual-${folder}`}
          className="block text-xs font-semibold text-gray-500 mb-1"
        >
          أو أدخل رابط الصورة مباشرة
        </label>
        <input
          id={`image-url-manual-${folder}`}
          type="url"
          value={currentUrl}
          onChange={(e) => onUpload(e.target.value)}
          placeholder="https://..."
          dir="ltr"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-mono text-left bg-white"
        />
      </div>

      {/* Media Library Modal for picking main image */}
      {showLibrary && (
        <MediaLibrary
          defaultFolder={folder}
          title="اختيار صورة رئيسية من المكتبة"
          onSelect={(url) => {
            onUpload(url)
            setShowLibrary(false)
          }}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  )
}
