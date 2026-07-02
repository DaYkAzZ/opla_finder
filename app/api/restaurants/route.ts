import { NextRequest, NextResponse } from 'next/server'
import { getCachedRestaurants, setCachedRestaurants } from '@/lib/cache'
import { fetchRestaurantsFromOSM } from '@/lib/overpass'
import { enrichWithTripAdvisor } from '@/lib/tripadvisor'
import { scoreAndSort } from '@/lib/scoring'
import { encodeGeohash } from '@/lib/geohash'
import type { ApiResponse } from '@/types/restaurant'
import type { CuisineTag, VenueType, PriceLevel } from '@/types/profile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const radiusParam = searchParams.get('radius')
  const cuisinesParam = searchParams.get('cuisines')
  const venueTypesParam = searchParams.get('venue_types')
  const priceLevelsParam = searchParams.get('price_levels')

  if (!latParam || !lngParam) {
    return NextResponse.json({ error: 'Paramètres lat et lng requis.' }, { status: 400 })
  }

  const lat = parseFloat(latParam)
  const lng = parseFloat(lngParam)
  const radius = radiusParam ? parseInt(radiusParam, 10) : 1000

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat et lng invalides.' }, { status: 400 })
  }

  const prefs = {
    cuisines: cuisinesParam ? (cuisinesParam.split(',') as CuisineTag[]) : [],
    venue_types: venueTypesParam ? (venueTypesParam.split(',') as VenueType[]) : [],
    price_levels: priceLevelsParam
      ? (priceLevelsParam.split(',').map(Number) as PriceLevel[])
      : [],
  }

  const hasPrefs = prefs.cuisines.length > 0 || prefs.venue_types.length > 0

  const geohash = encodeGeohash(lat, lng, 5)
  const cacheKey = hasPrefs
    ? `${geohash}:${cuisinesParam ?? ''}:${venueTypesParam ?? ''}`
    : geohash

  /* ── 1. Cache (non-bloquant) ───────────────────────────────── */
  try {
    const cached = await getCachedRestaurants(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }
  } catch (err) {
    // Cache indisponible (Supabase non configuré ou erreur réseau) → on continue
    console.warn('[cache] Lecture ignorée:', (err as Error).message)
  }

  /* ── 2. Overpass ───────────────────────────────────────────── */
  let osmRestaurants
  try {
    osmRestaurants = await fetchRestaurantsFromOSM(lat, lng, radius)
  } catch (err) {
    const msg = (err as Error).message
    console.error('[overpass] Erreur:', msg)
    return NextResponse.json(
      { error: `Impossible de récupérer les restaurants (OSM). Détail: ${msg}` },
      { status: 502 }
    )
  }

  if (!osmRestaurants || osmRestaurants.length === 0) {
    return NextResponse.json(
      { error: 'Aucun restaurant trouvé dans ce périmètre.' },
      { status: 404 }
    )
  }

  /* ── 3. TripAdvisor (non-bloquant) ─────────────────────────── */
  let enrichedRestaurants
  try {
    enrichedRestaurants = await enrichWithTripAdvisor(osmRestaurants)
  } catch (err) {
    console.warn('[tripadvisor] Fallback sans notes:', (err as Error).message)
    enrichedRestaurants = osmRestaurants
  }

  /* ── 4. Scoring ────────────────────────────────────────────── */
  const scored = scoreAndSort(enrichedRestaurants, hasPrefs ? prefs : undefined)

  if (scored.length === 0) {
    return NextResponse.json({ error: 'Aucun restaurant scoré.' }, { status: 404 })
  }

  const response: ApiResponse = {
    todaysPick: scored[0],
    topFive: scored.slice(1, 6),
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  }

  /* ── 5. Cache write (non-bloquant) ─────────────────────────── */
  try {
    await setCachedRestaurants(cacheKey, response)
  } catch (err) {
    console.warn('[cache] Écriture ignorée:', (err as Error).message)
  }

  return NextResponse.json(response)
}
