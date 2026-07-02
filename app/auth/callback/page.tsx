'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

// Cette page reçoit le code OAuth de Google et échange le token.
// Supabase gère ça automatiquement via le listener onAuthStateChange,
// mais on a besoin de cette route pour que le redirectTo soit valide.
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Échange le code présent dans l'URL contre une session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/')
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  return (
    <div className="loader">
      <div className="loader__spinner" />
      <p className="loader__text">Connexion en cours…</p>
    </div>
  )
}
