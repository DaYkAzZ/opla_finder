'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    accent: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'find',
    label: 'Find a Place',
    href: '/',
    accent: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M20 20L16.65 16.65"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profil',
    href: '/profile',
    accent: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M4 20C4 16.686 7.582 14 12 14C16.418 14 20 16.686 20 20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '420px',
        backgroundColor: '#FEFDFE',
        border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: '24px',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)',
        zIndex: 100,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href.split('?')[0]

        if (item.accent) {
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                textDecoration: 'none',
                backgroundColor: '#8AD384',
                borderRadius: '16px',
                padding: '10px 20px',
                color: '#1A1A1A',
                boxShadow: '0 4px 16px rgba(138,211,132,0.35)',
              }}
            >
              {item.icon}
              <span style={{ fontSize: '10px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </Link>
          )
        }

        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              color: isActive ? '#1A1A1A' : '#ABABAB',
            }}
          >
            {item.icon}
            <span style={{ fontSize: '10px', fontWeight: 500 }}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
