'use client'

import { usePathname } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const HIDE_NAV = ['/login', '/onboarding', '/auth/callback']

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = !HIDE_NAV.includes(pathname)

  return (
    <>
      <main style={{ paddingBottom: showNav ? 'var(--nav-height)' : '0' }}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </>
  )
}
