import type { Restaurant } from '@/types/restaurant'

const BASE_URL = 'https://api.content.tripadvisor.com/api/v1'
const TIMEOUT_MS = 5000
const DELAY_MS = 300 // respecter le rate limiting

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function getTripAdvisorRating(
  name: string,
  lat: number,
  lng: number,
  apiKey: string
): Promise<{ rating: number | null; rating_count: number | null }> {
  try {
    const searchUrl = `${BASE_URL}/location/search?searchQuery=${encodeURIComponent(name)}&latLong=${lat},${lng}&category=restaurants&key=${apiKey}`
    const searchRes = await fetchWithTimeout(searchUrl)
    if (!searchRes.ok) return { rating: null, rating_count: null }

    const searchJson = await searchRes.json()
    const locationId = searchJson?.data?.[0]?.location_id
    if (!locationId) return { rating: null, rating_count: null }

    const detailUrl = `${BASE_URL}/location/${locationId}/details?key=${apiKey}`
    const detailRes = await fetchWithTimeout(detailUrl)
    if (!detailRes.ok) return { rating: null, rating_count: null }

    const detail = await detailRes.json()
    return {
      rating: detail.rating ? parseFloat(detail.rating) : null,
      rating_count: detail.num_reviews ? parseInt(detail.num_reviews, 10) : null,
    }
  } catch {
    // Timeout ou erreur → fallback silencieux
    return { rating: null, rating_count: null }
  }
}

export async function enrichWithTripAdvisor(
  restaurants: Restaurant[]
): Promise<Restaurant[]> {
  const apiKey = process.env.TRIPADVISOR_API_KEY
  if (!apiKey) {
    console.warn('[tripadvisor] Pas de clé API — skip enrichissement')
    return restaurants
  }

  const enriched: Restaurant[] = []

  for (const restaurant of restaurants) {
    const { rating, rating_count } = await getTripAdvisorRating(
      restaurant.name,
      restaurant.lat,
      restaurant.lng,
      apiKey
    )
    enriched.push({ ...restaurant, rating, rating_count })
    await sleep(DELAY_MS)
  }

  return enriched
}
