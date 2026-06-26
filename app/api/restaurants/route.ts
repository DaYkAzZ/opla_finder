import { NextRequest, NextResponse } from 'next/server'
import { getCachedRestaurants, setCachedRestaurants } from '@/lib/cache'
import { fetchRestaurantsFromOSM } from '@/lib/overpass'
import { enrichWithTripAdvisor } from '@/lib/tripadvisor'
import { scoreAndSort } from '@/lib/scoring'
import { encodeGeohash } from '@/lib/geohash'
import type { ApiResponse } from '@/types/restaurant'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const radiusParam = searchParams.get('radius')

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: 'Paramètres lat et lng requis.' },
      { status: 400 }
    )
  }

  const lat = parseFloat(latParam)
  const lng = parseFloat(lngParam)
  const radius = radiusParam ? parseInt(radiusParam, 10) : 1000

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat et lng doivent être des nombres valides.' },
      { status: 400 }
    )
  }

  const geohash = encodeGeohash(lat, lng, 5)

  /* ── 1. Cache Supabase ─────────────────────────────────────── */
  try {
    const cached = await getCachedRestaurants(geohash)
    if (cached) {
      return NextResponse.json({ ...cached, fromCache: true })
    }
  } catch (err) {
    console.error('[cache] Erreur lecture:', err)
  }

  /* ── 2. Overpass (OSM) ─────────────────────────────────────── */
  let osmRestaurants
  try {
    osmRestaurants = await fetchRestaurantsFromOSM(lat, lng, radius)
  } catch (err) {
    console.error('[overpass] Erreur:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer les restaurants (timeout OSM).' },
      { status: 502 }
    )
  }

  if (!osmRestaurants || osmRestaurants.length === 0) {
    return NextResponse.json(
      { error: 'Aucun restaurant trouvé dans ce périmètre.' },
      { status: 404 }
    )
  }

  /* ── 3. Enrichissement TripAdvisor ─────────────────────────── */
  let enrichedRestaurants
  try {
    enrichedRestaurants = await enrichWithTripAdvisor(osmRestaurants)
  } catch (err) {
    console.error('[tripadvisor] Erreur globale, fallback sans notes:', err)
    enrichedRestaurants = osmRestaurants
  }

  /* ── 4. Scoring serveur ────────────────────────────────────── */
  const scored = scoreAndSort(enrichedRestaurants)

  if (scored.length === 0) {
    return NextResponse.json({ error: 'Aucun restaurant scoré.' }, { status: 404 })
  }

  const response: ApiResponse = {
    todaysPick: scored[0],
    topFive: scored.slice(1, 6),
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  }

  /* ── 5. Save cache ─────────────────────────────────────────── */
  try {
    await setCachedRestaurants(geohash, response)
  } catch (err) {
    console.error('[cache] Erreur écriture:', err)
  }

  return NextResponse.json(response)
}
