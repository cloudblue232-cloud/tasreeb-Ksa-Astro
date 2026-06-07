import ServiceForm from '@/components/admin/ServiceForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'خدمة جديدة | Admin' }

export default function NewServicePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">خدمة جديدة</h1>
        <p className="text-gray-500 mt-1">أضف خدمة جديدة إلى الموقع</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <ServiceForm />
      </div>
    </div>
  )
}
