'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@saudi-leaks/shared/supabase/client'

interface ImageUploadProps {
  bucket: string
  folder: string
  currentUrl: string
  onUpload: (url: string) => void
}

export default function ImageUpload({ bucket, folder, currentUrl, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
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
  }

  function handleRemove() {
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>
      )}

      {/* Preview */}
      {currentUrl && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <Image
            src={currentUrl}
            alt="صورة مرفوعة"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
          <button
            type="button"
            id="image-remove-btn"
            onClick={handleRemove}
            className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow transition-colors text-sm font-bold"
            aria-label="إزالة الصورة"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload area */}
      <label
        htmlFor="image-upload-input"
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading
            ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="text-sm font-semibold">جاري الرفع...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm font-semibold text-gray-600">
              {currentUrl ? 'تغيير الصورة' : 'رفع صورة'}
            </span>
            <span className="text-xs text-gray-400">PNG, JPG, WEBP — حتى 5MB</span>
          </div>
        )}
        <input
          ref={inputRef}
          id="image-upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {/* Manual URL input */}
      <div>
        <label htmlFor="image-url-manual" className="block text-xs font-semibold text-gray-500 mb-1">
          أو أدخل رابط الصورة مباشرة
        </label>
        <input
          id="image-url-manual"
          type="url"
          value={currentUrl}
          onChange={e => onUpload(e.target.value)}
          placeholder="https://..."
          dir="ltr"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm font-mono text-left"
        />
      </div>
    </div>
  )
}
