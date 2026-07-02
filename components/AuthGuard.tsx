'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'

// Routes publiques (pas besoin d'être connecté)
const PUBLIC_ROUTES = ['/login', '/auth/callback']

interface Props {
  children: React.ReactNode
}

export default function AuthGuard({ children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { state, user } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user)

  useEffect(() => {
    if (state === 'loading' || profileLoading) return

    const isPublic = PUBLIC_ROUTES.includes(pathname)

    if (state === 'unauthenticated') {
      if (!isPublic) router.replace('/login')
      return
    }

    // Connecté mais pas encore de profil complet
    if (state === 'authenticated' && profile) {
      if (!profile.onboarding_done && pathname !== '/onboarding') {
        router.replace('/onboarding')
        return
      }

      if (profile.onboarding_done && pathname === '/onboarding') {
        router.replace('/')
        return
      }

      if (isPublic) {
        router.replace('/')
        return
      }
    }
  }, [state, profile, profileLoading, pathname, router])

  // Écran de chargement pendant la résolution auth
  if (state === 'loading' || profileLoading) {
    return (
      <div className="loader">
        <div className="loader__spinner" />
      </div>
    )
  }

  return <>{children}</>
}
