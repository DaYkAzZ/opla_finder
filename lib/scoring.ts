import type { Restaurant, ScoredRestaurant, RecommendationReason } from '@/types/restaurant'

function assignReason(r: Restaurant): RecommendationReason {
  if (r.rating !== null && r.rating >= 4.5 && (r.rating_count ?? 0) >= 50) {
    return 'top_rated'
  }
  if (r.distance_meters < 200) {
    return 'closest'
  }
  if (r.osm_tags_count >= 8) {
    return 'well_referenced'
  }
  return 'closest'
}

export function scoreAndSort(restaurants: Restaurant[]): ScoredRestaurant[] {
  if (restaurants.length === 0) return []

  const maxDistance = Math.max(...restaurants.map((r) => r.distance_meters))

  const scored: ScoredRestaurant[] = restaurants.map((r) => {
    const noteNorm = r.rating !== null ? r.rating / 5 : 0.5
    const proxNorm = maxDistance > 0 ? 1 - r.distance_meters / maxDistance : 1
    const osmNorm = Math.min(r.osm_tags_count / 10, 1)

    const score = noteNorm * 0.5 + proxNorm * 0.35 + osmNorm * 0.15

    return {
      ...r,
      reason: assignReason(r),
      score,
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}
