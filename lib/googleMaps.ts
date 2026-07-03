import type { Restaurant } from "@/types/restaurant";

const PLACES_BASE = "https://places.googleapis.com/v1";
const DELAY_MS = 80;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url: string, options: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function getPhotoUrl(restaurant: Restaurant, apiKey: string): Promise<string | null> {
  try {
    // 1. Text search → place_id + photo_name
    const searchRes = await fetchWithTimeout(
      `${PLACES_BASE}/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.photos",
        },
        body: JSON.stringify({
          textQuery: `${restaurant.name} ${restaurant.address}`,
          locationBias: {
            circle: {
              center: { latitude: restaurant.lat, longitude: restaurant.lng },
              radius: 500,
            },
          },
          maxResultCount: 1,
        }),
      },
      6000
    );

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json().catch(() => null);
    const photoName = searchData?.places?.[0]?.photos?.[0]?.name;
    if (!photoName) return null;

    // 2. Fetch photo → on utilise l'URL de la media resource directement
    // Places New API retourne une URL publique skipHttp
    const photoUrl = `${PLACES_BASE}/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${apiKey}&skipHttpRedirect=false`;
    return photoUrl;
  } catch {
    return null;
  }
}

export async function enrichWithGoogleImages(
  restaurants: Restaurant[]
): Promise<Restaurant[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.warn("[googlePlaces] Pas de GOOGLE_PLACES_API_KEY → images skippées");
    return restaurants;
  }

  const enriched: Restaurant[] = [];

  for (const r of restaurants) {
    const image_url = await getPhotoUrl(r, apiKey);
    enriched.push({ ...r, image_url });
    await sleep(DELAY_MS);
  }

  return enriched;
}
