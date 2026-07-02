import type { Restaurant, ScoredRestaurant, RecommendationReason } from '@/types/restaurant'
import type { CuisineTag, VenueType, PriceLevel } from '@/types/profile'

export interface UserPrefs {
  cuisines: CuisineTag[]
  venue_types: VenueType[]
  price_levels: PriceLevel[]
}

// Mapping OSM amenity → VenueType
const OSM_AMENITY_TO_VENUE: Record<string, VenueType> = {
  restaurant: 'restaurant',
  bar: 'bar',
  cafe: 'cafe',
  fast_food: 'fast_food',
  bistro: 'bistro',
  brasserie: 'brasserie',
}

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

export function scoreAndSort(
  restaurants: Restaurant[],
  prefs?: UserPrefs
): ScoredRestaurant[] {
  if (restaurants.length === 0) return []

  const maxDistance = Math.max(...restaurants.map((r) => r.distance_meters))

  const scored: ScoredRestaurant[] = restaurants.map((r) => {
    const noteNorm = r.rating !== null ? r.rating / 5 : 0.5
    const proxNorm = maxDistance > 0 ? 1 - r.distance_meters / maxDistance : 1
    const osmNorm = Math.min(r.osm_tags_count / 10, 1)

    let baseScore = noteNorm * 0.5 + proxNorm * 0.35 + osmNorm * 0.15

    // Boost si le restaurant matche les préférences utilisateur
    if (prefs) {
      let matchBonus = 0

      // Cuisine match → +0.15
      if (prefs.cuisines.length > 0 && r.cuisine) {
        const osmCuisines = r.cuisine.split(';').map((c) => c.trim())
        const matches = osmCuisines.some((c) => prefs.cuisines.includes(c as CuisineTag))
        if (matches) matchBonus += 0.15
      }

      // Type de lieu match → +0.10
      if (prefs.venue_types.length > 0 && r.venue_type) {
        const venueMatch = prefs.venue_types.includes(r.venue_type as VenueType)
        if (venueMatch) matchBonus += 0.10
      }

      baseScore = Math.min(1, baseScore + matchBonus)
    }

    return {
      ...r,
      reason: assignReason(r),
      score: baseScore,
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}
