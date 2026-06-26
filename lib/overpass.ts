import type { Restaurant } from '@/types/restaurant'

interface OSMNode {
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000 // rayon Terre en mètres
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function fetchRestaurantsFromOSM(
  lat: number,
  lng: number,
  radius: number
): Promise<Restaurant[]> {
  const query = `[out:json][timeout:10];
node["amenity"="restaurant"](around:${radius},${lat},${lng});
out body;`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  let res: Response
  try {
    res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        'User-Agent': 'Opla/0.1 (https://opla.app)',
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Overpass HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`)
  }

  const json = await res.json()
  const nodes: OSMNode[] = json.elements ?? []

  return nodes
    .filter((n) => n.tags?.name)
    .map((n) => {
      const tags = n.tags ?? {}
      const tagKeys = Object.keys(tags)
      const street = tags['addr:street']
        ? `${tags['addr:housenumber'] ?? ''} ${tags['addr:street']}`.trim()
        : ''

      return {
        id: `osm-${n.id}`,
        name: tags.name!,
        lat: n.lat,
        lng: n.lon,
        address: street || 'Adresse inconnue',
        cuisine: tags.cuisine ?? null,
        opening_hours: tags.opening_hours ?? null,
        phone: tags.phone ?? tags['contact:phone'] ?? null,
        website: tags.website ?? tags['contact:website'] ?? null,
        rating: null,
        rating_count: null,
        osm_tags_count: tagKeys.length,
        distance_meters: haversineDistance(lat, lng, n.lat, n.lon),
        reason: 'closest' as const,
      }
    })
}
