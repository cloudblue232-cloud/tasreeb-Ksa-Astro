import ArticleForm from '@/components/admin/ArticleForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'مقال جديد | Admin' }

export default function NewArticlePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">مقال جديد</h1>
        <p className="text-gray-500 mt-1">أضف مقالاً جديداً إلى الموقع</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <ArticleForm />
      </div>
    </div>
  )
}
