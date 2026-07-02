import { getSupabaseServer } from './supabase'
import type { ApiResponse } from '@/types/restaurant'

const TTL_HOURS = 24

export async function getCachedRestaurants(geohash: string): Promise<ApiResponse | null> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('restaurants_cache')
    .select('data')
    .eq('geohash', geohash)
    .gte('fetched_at', new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000).toISOString())
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  // PGRST116 = "no rows found" → pas une vraie erreur
  if (error?.code === 'PGRST116' || !data) return null
  if (error) throw error

  return data.data as ApiResponse
}

export async function setCachedRestaurants(
  geohash: string,
  response: ApiResponse
): Promise<void> {
  const supabase = getSupabaseServer()

  const { error } = await supabase.from('restaurants_cache').insert({
    geohash,
    data: response,
    fetched_at: new Date().toISOString(),
  })

  if (error) throw error
}
