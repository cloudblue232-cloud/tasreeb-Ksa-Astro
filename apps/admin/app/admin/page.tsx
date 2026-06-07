import { createClient } from '@saudi-leaks/shared/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'لوحة التحكم | Admin' }

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [{ count: articlesCount }, { count: servicesCount }] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'عدد المقالات', value: articlesCount ?? 0, icon: '📝', href: '/admin/articles', color: 'from-blue-500 to-blue-700' },
    { label: 'عدد الخدمات', value: servicesCount ?? 0, icon: '🛠️', href: '/admin/services', color: 'from-indigo-500 to-indigo-700' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-500 mt-1">مرحباً بك في لوحة إدارة الموقع</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {stats.map(stat => (
          <Link key={stat.href} href={stat.href} id={`dashboard-stat-${stat.label}`} className="group">
            <div className={`bg-gradient-to-br ${stat.color} rounded-2xl p-7 text-white shadow-lg hover:shadow-xl transition-shadow`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{stat.icon}</span>
                <span className="text-5xl font-extrabold">{stat.value}</span>
              </div>
              <p className="font-bold text-lg opacity-90">{stat.label}</p>
              <p className="text-sm opacity-70 mt-1 group-hover:opacity-100 transition-opacity">انقر للإدارة ←</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-5 text-lg">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/articles/new" id="dashboard-new-article-btn" className="btn-primary !text-sm">
            ➕ مقال جديد
          </Link>
          <Link href="/admin/services/new" id="dashboard-new-service-btn" className="btn-primary !text-sm !bg-indigo-600 hover:!bg-indigo-700">
            ➕ خدمة جديدة
          </Link>
          <Link href="/" target="_blank" id="dashboard-view-site-btn" className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
            👁️ عرض الموقع
          </Link>
        </div>
      </div>
    </div>
  )
}
