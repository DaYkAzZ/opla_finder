'use client'

import { useState, useEffect } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export function useAuth() {
  const [state, setState] = useState<AuthState>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Session initiale
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setState(data.session ? 'authenticated' : 'unauthenticated')
    })

    // Listener sur les changements d'auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setState(s ? 'authenticated' : 'unauthenticated')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return { state, session, user }
}
