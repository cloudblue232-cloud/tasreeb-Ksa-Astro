import { createClient } from '@saudi-leaks/shared/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import DeleteButton from '@/components/admin/DeleteButton'
import { revalidateAstroPaths } from '@/app/actions/revalidate'

export const metadata: Metadata = { title: 'إدارة الخدمات | Admin' }

const PAGE_SIZE = 15

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: services, count } = await supabase
    .from('services')
    .select('id, title, slug, published, sort_order, created_at', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  async function deleteService(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const slug = formData.get('slug') as string
    const supabase = await createClient()
    await supabase.from('services').delete().eq('id', id)
    
    // Trigger ISR revalidation
    await revalidateAstroPaths(['/', '/services', `/services/${slug}`])

    redirect('/admin/services')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة الخدمات</h1>
          <p className="text-gray-500 mt-1">{count ?? 0} خدمة</p>
        </div>
        <Link href="/admin/services/new" id="services-new-btn" className="btn-primary">
          ➕ خدمة جديدة
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {(!services || services.length === 0) ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-4">🛠️</div>
            <p className="font-medium">لا توجد خدمات بعد</p>
            <Link href="/admin/services/new" className="text-blue-600 font-semibold mt-2 inline-block hover:underline">
              أضف أول خدمة
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">اسم الخدمة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden lg:table-cell">الترتيب</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden md:table-cell">Slug</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{service.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        service.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${service.published ? 'bg-green-500' : 'bg-amber-500'}`} />
                        {service.published ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                        #{service.sort_order}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded-md">{service.slug}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(service.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/services/${service.id}`} id={`edit-service-${service.id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          تعديل
                        </Link>
                        <Link href={`/services/${service.slug}`} target="_blank"
                          className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                          عرض
                        </Link>
                        <form action={deleteService}>
                          <input type="hidden" name="id" value={service.id} />
                          <input type="hidden" name="slug" value={service.slug} />
                          <DeleteButton id={`delete-service-${service.id}`} message="هل أنت متأكد من حذف هذه الخدمة؟" />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  صفحة {page} من {totalPages} — إجمالي {count} خدمة
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link href={`?page=${page - 1}`}
                      className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white transition-colors">
                      ← السابق
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link href={`?page=${page + 1}`}
                      className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg hover:bg-white transition-colors">
                      التالي →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
