import SettingsForm from '@/components/admin/SettingsForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'إعدادات الموقع | لوحة التحكم' }

export default function SettingsPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">إعدادات الموقع الشاملة</h1>
        <p className="text-gray-500 mt-1 text-sm">
          تحكم في الهوية البصرية، بيانات SEO والكلمات المفتاحية، قنوات الاتصال، بكسلات الإعلانات، والأكواد البرمجية المخصصة.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Main form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <SettingsForm />
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2.5 text-sm">💡 نصائح سريعة</h3>
            <ul className="space-y-2 text-xs text-blue-800 leading-relaxed">
              <li>• <strong>مكتبة الصور:</strong> يمكنك اختيار الشعار والأيقونة مباشرة من الصور المرفوعة مسبقاً.</li>
              <li>• <strong>Google Search Console:</strong> ضع رمز التحقق لتأكيد الملكية ومتابعة أرشفة الموقع.</li>
              <li>• <strong>الكلمات المفتاحية:</strong> افصل بين الكلمات بفاصلة عربية أو إنجليزية.</li>
              <li>• <strong>التحديث الفوري:</strong> عند الحفظ يتم مسح الـ Cache وتنعكس التغييرات تلقائياً على الموقع.</li>
            </ul>
          </div>

          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2.5 text-sm">📊 بكسلات الإعلانات والتتبع</h3>
            <ul className="space-y-2 text-xs text-amber-800 leading-relaxed">
              <li>• <strong>سناب وتيك توك:</strong> ضع معرّف البكسل فقط ليتم تتبع الزوار وإعادة استهدافهم في الحملات.</li>
              <li>• <strong>Google Analytics:</strong> ضع معرّف القياس (G-XXXXXXXX) لمعرفة إحصائيات الزوار.</li>
              <li>• <strong>Google Ads:</strong> ضع معرّف الحساب (AW-XXXXXXXX).</li>
            </ul>
          </div>

          <div className="bg-purple-50/80 rounded-2xl p-5 border border-purple-200">
            <h3 className="font-bold text-purple-900 mb-2 text-sm">💻 الأكواد المخصصة</h3>
            <p className="text-xs text-purple-800 leading-relaxed mb-2">
              إذا كان لديك أدوات خارجية مثل (Microsoft Clarity أو Hotjar أو أدوات المحادثة المباشرة)، ضعها في تبويب <strong>"أكواد مخصصة"</strong> وسيتم حقنها فوراً في كل الصفحات.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
