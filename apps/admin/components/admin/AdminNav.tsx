'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@saudi-leaks/shared/supabase/client'

interface AdminNavProps {
  userEmail: string
}

const navItems = [
  { href: '/admin', label: 'لوحة التحكم', icon: '📊', exact: true },
  { href: '/admin/articles', label: 'المقالات', icon: '📝', exact: false },
  { href: '/admin/services', label: 'الخدمات', icon: '🛠️', exact: false },
]

export default function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen flex-shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm text-white">لوحة التحكم</p>
            <p className="text-xs text-blue-300">المشرف</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1" aria-label="القائمة الإدارية">
        {navItems.map(item => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`admin-nav-${item.href.replace(/\//g, '-').replace(/^-/, '')}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            {userEmail[0]?.toUpperCase()}
          </div>
          <p className="text-xs text-blue-300 truncate flex-1" dir="ltr">{userEmail}</p>
        </div>
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
