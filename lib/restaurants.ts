import type { ApiResponse, Restaurant } from '@/types/restaurant'

export function allRestaurants(data: ApiResponse): Restaurant[] {
  const seen = new Set<string>()
  return [data.todaysPick, ...data.topFive].filter((r) => {
    if (seen.has(r.id)) return false
    seen.add(r.id)
    return true
  })
}

export function sortByRating(restaurants: Restaurant[]): Restaurant[] {
  return [...restaurants].sort((a, b) => {
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0)
    if (ratingDiff !== 0) return ratingDiff
    return a.distance_meters - b.distance_meters
  })
}

export function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`
}
