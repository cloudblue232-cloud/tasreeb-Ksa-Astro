import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: { default: 'لوحة التحكم', template: '%s | لوحة التحكم' },
  description: 'لوحة تحكم إدارة موقع كشف التسربات والعزل بالسعودية',
  robots: { index: false, follow: false }, // Never index admin
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
