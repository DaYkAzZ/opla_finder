'use client'

import { useState, useEffect } from 'react'
import { getProfile, createProfile } from '@/lib/profile'
import type { UserProfile } from '@/types/profile'
import type { User } from '@supabase/supabase-js'

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    getProfile(user.id).then(async (p) => {
      if (p) {
        setProfile(p)
      } else {
        // Premier login : on crée le profil
        try {
          const created = await createProfile(
            user.id,
            user.user_metadata?.full_name ?? null,
            user.user_metadata?.avatar_url ?? null
          )
          setProfile(created)
        } catch (err) {
          console.error('[useProfile] Impossible de créer le profil:', err)
        }
      }
      setLoading(false)
    })
  }, [user])

  return { profile, setProfile, loading }
}
