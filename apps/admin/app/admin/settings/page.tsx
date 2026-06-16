import SettingsForm from '@/components/admin/SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'إعدادات الموقع | Admin' }

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">إعدادات الموقع</h1>
        <p className="text-gray-500 mt-1">
          تحكم في المعلومات الأساسية للموقع وسكريبت Google Ads
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <SettingsForm />
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-3">💡 كيف تعمل الإعدادات؟</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• تُحفظ الإعدادات في قاعدة البيانات مباشرة</li>
              <li>• تنعكس التغييرات على الموقع فور الحفظ</li>
              <li>• عنوان ووصف الموقع يظهران في Google</li>
              <li>• رقم واتساب يُستخدم في زر الاتصال العائم</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-bold text-amber-900 mb-3">📢 Google Ads</h3>
            <ul className="space-y-2 text-sm text-amber-700">
              <li>• أدخل معرّف الحساب (AW-XXXXXXXXX)</li>
              <li>• سيُضاف السكريبت تلقائياً لكل الصفحات</li>
              <li>• اتركه فارغاً لتعطيل الإعلانات</li>
            </ul>
            <a
              href="https://ads.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 underline"
            >
              فتح Google Ads ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
