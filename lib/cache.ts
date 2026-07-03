import { getSupabaseServer } from './supabase'
import type { ApiResponse } from '@/types/restaurant'

const TTL_HOURS = 24

export async function getCachedRestaurants(cacheKey: string): Promise<ApiResponse | null> {
  let supabase
  try {
    supabase = getSupabaseServer()
  } catch {
    return null // Supabase non configuré → skip cache silencieusement
  }

  const { data, error } = await supabase
    .from('restaurants_cache')
    .select('data')
    .eq('cache_key', cacheKey)
    .gte('fetched_at', new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000).toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (error?.code === 'PGRST116' || !data) return null
  if (error) throw error

  return data.data as ApiResponse
}

export async function setCachedRestaurants(
  cacheKey: string,
  response: ApiResponse
): Promise<void> {
  let supabase
  try {
    supabase = getSupabaseServer()
  } catch {
    return // Supabase non configuré → skip silencieusement
  }

  const { error } = await supabase.from('restaurants_cache').insert({
    cache_key: cacheKey,
    data: response,
    fetched_at: new Date().toISOString(),
  })

  if (error) throw error
}
