import { createClient } from '@saudi-leaks/shared/supabase/server'
import { notFound } from 'next/navigation'
import ServiceForm from '@/components/admin/ServiceForm'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'تعديل الخدمة | Admin' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: service } = await supabase
    .from('services').select('*').eq('id', id).single()

  if (!service) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">تعديل الخدمة</h1>
          <p className="text-gray-500 mt-1 text-sm">{service.title}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/services/${service.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            👁️ عرض الخدمة
          </Link>
          <Link
            href="/admin/services"
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            ← العودة
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <ServiceForm service={service} />
      </div>
    </div>
  )
}
