'use client'

import { useState, useCallback, useEffect } from 'react'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useAnonymousId } from '@/hooks/useAnonymousId'
import { trackEvent } from '@/lib/analytics'
import type { ApiResponse } from '@/types/restaurant'

export type RestaurantsState = 'idle' | 'locating' | 'loading' | 'success' | 'error'

export function useRestaurants(autoFetch = false) {
  const [state, setState] = useState<RestaurantsState>('idle')
  const [data, setData] = useState<ApiResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const anonymousId = useAnonymousId()
  const { requestLocation } = useGeolocation()

  const load = useCallback(async () => {
    setState('locating')
    setErrorMsg(null)

    let coords: { lat: number; lng: number }

    try {
      coords = await requestLocation()
    } catch {
      setState('error')
      setErrorMsg('Géolocalisation refusée. Active la localisation pour continuer.')
      trackEvent('location_denied')
      return
    }

    trackEvent('location_granted', { anonymous_id: anonymousId })
    setState('loading')

    const startMs = Date.now()

    try {
      const res = await fetch(`/api/restaurants?lat=${coords.lat}&lng=${coords.lng}`)
      if (!res.ok) throw new Error('Erreur serveur')

      const json: ApiResponse = await res.json()
      setData(json)
      setState('success')

      trackEvent('results_loaded', {
        from_cache: json.fromCache,
        duration_ms: Date.now() - startMs,
      })
    } catch {
      setState('error')
      setErrorMsg('Impossible de charger les restaurants. Réessaie.')
    }
  }, [anonymousId, requestLocation])

  useEffect(() => {
    if (autoFetch) load()
  }, [autoFetch, load])

  return { state, data, errorMsg, load, anonymousId }
}
