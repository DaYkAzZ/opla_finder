import type { Restaurant } from "@/types/restaurant";

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Résout le type de lieu depuis les tags OSM
function resolveVenueType(tags: Record<string, string>): string | null {
  const explicitTypes = ["bar", "cafe", "fast_food", "bistro", "brasserie"];
  for (const t of explicitTypes) {
    if (tags.amenity === t || tags[t] === "yes") return t;
  }
  if (tags.amenity === "restaurant") return "restaurant";
  return null;
}

function buildFallbackRestaurants(
  lat: number,
  lng: number,
  radius: number,
): Restaurant[] {
  const fallbackPlaces = [
    { name: "Le Petit Bistrot", cuisine: "french", venue_type: "bistro" },
    { name: "Café du Marché", cuisine: "cafe", venue_type: "cafe" },
    { name: "Pizza Locale", cuisine: "italian", venue_type: "restaurant" },
    { name: "Quick Bite", cuisine: "fast_food", venue_type: "fast_food" },
  ];

  const safeRadius = Math.max(radius, 500);
  const offsets = [
    [0.0006, 0.0004],
    [-0.0008, 0.0007],
    [0.0009, -0.0005],
    [-0.0004, -0.0009],
  ] as const;

  return fallbackPlaces.map((place, index) => {
    const [latOffset, lngOffset] = offsets[index];
    const restaurantLat = lat + latOffset;
    const restaurantLng = lng + lngOffset;

    return {
      id: `fallback-${index}`,
      name: place.name,
      lat: restaurantLat,
      lng: restaurantLng,
      address: "Adresse de secours",
      cuisine: place.cuisine,
      venue_type: place.venue_type,
      opening_hours: null,
      phone: null,
      website: null,
      rating: null,
      rating_count: null,
      osm_tags_count: 4,
      distance_meters: Math.min(
        safeRadius,
        haversineDistance(lat, lng, restaurantLat, restaurantLng),
      ),
      reason: "closest" as const,
    };
  });
}

export async function fetchRestaurantsFromOSM(
  lat: number,
  lng: number,
  radius: number,
): Promise<Restaurant[]> {
  const query = [
    "[out:json][timeout:25];",
    "(",
    `node["amenity"="restaurant"](around:${radius},${lat},${lng});`,
    `node["amenity"="bar"](around:${radius},${lat},${lng});`,
    `node["amenity"="cafe"](around:${radius},${lat},${lng});`,
    `node["amenity"="fast_food"](around:${radius},${lat},${lng});`,
    `node["amenity"="bistro"](around:${radius},${lat},${lng});`,
    `node["amenity"="brasserie"](around:${radius},${lat},${lng});`,
    ");",
    "out body;",
  ].join("");

  const body = new URLSearchParams({ data: query });
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(
          `[overpass] ${endpoint} -> ${res.status}: ${text.slice(0, 120)}`,
        );
        continue;
      }

      const json = await res.json().catch(() => null);
      const nodes: OSMNode[] = Array.isArray(json?.elements)
        ? json.elements
        : [];
      const mapped = nodes
        .filter((n) => n.tags?.name)
        .map((n) => {
          const tags = n.tags ?? {};
          const tagKeys = Object.keys(tags);
          const street = tags["addr:street"]
            ? `${tags["addr:housenumber"] ?? ""} ${tags["addr:street"]}`.trim()
            : "";

          return {
            id: `osm-${n.id}`,
            name: tags.name!,
            lat: n.lat,
            lng: n.lon,
            address: street || "Adresse inconnue",
            cuisine: tags.cuisine ?? null,
            venue_type: resolveVenueType(tags),
            opening_hours: tags.opening_hours ?? null,
            phone: tags.phone ?? tags["contact:phone"] ?? null,
            website: tags.website ?? tags["contact:website"] ?? null,
            rating: null,
            rating_count: null,
            osm_tags_count: tagKeys.length,
            distance_meters: haversineDistance(lat, lng, n.lat, n.lon),
            reason: "closest" as const,
          };
        });

      if (mapped.length > 0) {
        return mapped;
      }
    } catch (error) {
      console.warn(`[overpass] ${endpoint} a échoué:`, error);
    } finally {
      clearTimeout(timeout);
    }
  }

  console.warn(
    "[overpass] Utilisation du fallback local après plusieurs échecs",
  );
  return buildFallbackRestaurants(lat, lng, radius);
}
