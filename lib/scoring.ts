import type {
  Restaurant,
  ScoredRestaurant,
  RecommendationReason,
} from "@/types/restaurant";
import type { CuisineTag, VenueType, PriceLevel } from "@/types/profile";

export interface UserPrefs {
  cuisines: CuisineTag[];
  venue_types: VenueType[];
  price_levels: PriceLevel[];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function matchesCuisine(r: Restaurant, prefs: UserPrefs): boolean {
  if (!prefs.cuisines.length || !r.cuisine) return false;
  return r.cuisine
    .split(";")
    .map((c) => c.trim().toLowerCase())
    .some((c) => prefs.cuisines.includes(c as CuisineTag));
}

function matchesVenue(r: Restaurant, prefs: UserPrefs): boolean {
  if (!prefs.venue_types.length || !r.venue_type) return false;
  return prefs.venue_types.includes(r.venue_type as VenueType);
}

export function matchesPrefs(r: Restaurant, prefs: UserPrefs): boolean {
  return matchesCuisine(r, prefs) || matchesVenue(r, prefs);
}

function assignReason(
  r: Restaurant,
  slot: "match" | "top_rated" | "discovery"
): RecommendationReason {
  if (slot === "top_rated") return "top_rated";
  if (slot === "discovery") return "never_tried";
  // slot === "match" → raison la plus pertinente
  if (r.rating !== null && r.rating >= 4.5 && (r.rating_count ?? 0) >= 50)
    return "top_rated";
  if (r.distance_meters < 200) return "closest";
  if (r.osm_tags_count >= 8) return "well_referenced";
  return "closest";
}

// ── Score de base (sans prefs) ─────────────────────────────────────────────

function baseScore(r: Restaurant, maxDistance: number): number {
  const noteNorm = r.rating !== null ? r.rating / 5 : 0.5;
  const proxNorm = maxDistance > 0 ? 1 - r.distance_meters / maxDistance : 1;
  const osmNorm = Math.min(r.osm_tags_count / 10, 1);
  return noteNorm * 0.5 + proxNorm * 0.35 + osmNorm * 0.15;
}

// ── Export principal ────────────────────────────────────────────────────────

/**
 * Construit une sélection curatée de 6 restaurants (1 pick + 5 top) :
 *
 * Sans prefs → top 6 par score brut
 *
 * Avec prefs :
 *   Slot 0 (todaysPick) : meilleur match prefs
 *   Slots 1-3           : 3 restaurants qui matchent les prefs (triés par score)
 *   Slot 4              : meilleur restaurant bien noté (≥4.0) hors prefs
 *   Slot 5              : découverte — hors prefs, le moins attendu (plus faible score brut parmi ceux avec un nom)
 *
 * Si pas assez de restaurants dans une catégorie, les slots restants sont
 * remplis avec le meilleur disponible non encore sélectionné.
 */
export function buildCuratedSelection(
  restaurants: Restaurant[],
  prefs?: UserPrefs
): ScoredRestaurant[] {
  if (restaurants.length === 0) return [];

  const maxDist = Math.max(...restaurants.map((r) => r.distance_meters));
  const hasPrefs =
    prefs && (prefs.cuisines.length > 0 || prefs.venue_types.length > 0);

  // Score brut pour tous
  const allScored = restaurants.map((r) => ({
    ...r,
    score: baseScore(r, maxDist),
    reason: "closest" as RecommendationReason, // placeholder, réassigné après
  }));
  allScored.sort((a, b) => b.score - a.score);

  // Sans prefs → top 6 simple
  if (!hasPrefs) {
    return allScored.slice(0, 6).map((r) => ({
      ...r,
      reason: assignReason(r, "match"),
    }));
  }

  // ── Partitionnement ──────────────────────────────────────────────────────
  const matches = allScored.filter((r) => matchesPrefs(r, prefs));
  const nonMatches = allScored.filter((r) => !matchesPrefs(r, prefs));

  // Slot top_rated : meilleur score parmi les non-matches bien notés (≥4.0)
  // Si aucun ≥4.0, on prend le mieux noté disponible parmi les non-matches
  const topRatedPool = nonMatches.filter((r) => (r.rating ?? 0) >= 4.0);
  const topRatedCandidate =
    topRatedPool.length > 0
      ? topRatedPool.reduce((best, r) => (r.rating! > best.rating! ? r : best))
      : nonMatches[0] ?? null;

  // Slot discovery : parmi les non-matches qui NE sont PAS le topRated,
  // on prend celui qui est le moins prévisible = score brut le plus bas
  // (mais pas trop loin : on exclut les 25% les plus éloignés)
  const maxAcceptableDistance =
    maxDist * 0.75;
  const discoveryPool = nonMatches.filter(
    (r) =>
      r.id !== topRatedCandidate?.id &&
      r.distance_meters <= maxAcceptableDistance
  );
  // Inverser le tri : on veut le moins bien scoré (surprise maximale)
  const discoveryCandidate =
    discoveryPool.length > 0
      ? discoveryPool[discoveryPool.length - 1]
      : null;

  // ── Construction des 6 slots ─────────────────────────────────────────────
  const reserved = new Set<string>(
    [topRatedCandidate?.id, discoveryCandidate?.id].filter(Boolean) as string[]
  );

  // 4 meilleurs matches (slot 0 = pick, slots 1-3 = top 5 positions 1-3)
  const matchSlots = matches
    .filter((r) => !reserved.has(r.id))
    .slice(0, 4)
    .map((r) => ({ ...r, reason: assignReason(r, "match") as RecommendationReason }));

  // Compléter si pas assez de matches
  const allReservedIds = new Set([
    ...reserved,
    ...matchSlots.map((r) => r.id),
  ]);
  const filler = allScored.filter((r) => !allReservedIds.has(r.id));

  while (matchSlots.length < 4 && filler.length > 0) {
    const r = filler.shift()!;
    matchSlots.push({ ...r, reason: assignReason(r, "match") });
    allReservedIds.add(r.id);
  }

  // Assembler dans l'ordre : [pick, match1, match2, match3, top_rated, discovery]
  const result: ScoredRestaurant[] = [];

  // pick (slot 0)
  if (matchSlots[0]) result.push(matchSlots[0]);

  // top 5 positions 1-3 : matches
  for (const r of matchSlots.slice(1)) result.push(r);

  // position 4 : top rated hors prefs
  if (topRatedCandidate) {
    result.push({
      ...topRatedCandidate,
      reason: assignReason(topRatedCandidate, "top_rated"),
    });
  }

  // position 5 : découverte
  if (discoveryCandidate) {
    result.push({
      ...discoveryCandidate,
      reason: assignReason(discoveryCandidate, "discovery"),
    });
  }

  // Sécurité : compléter jusqu'à 6 si manque de données
  const finalIds = new Set(result.map((r) => r.id));
  for (const r of allScored) {
    if (result.length >= 6) break;
    if (!finalIds.has(r.id)) {
      result.push({ ...r, reason: assignReason(r, "match") });
      finalIds.add(r.id);
    }
  }

  return result.slice(0, 6);
}

// Alias pour la rétrocompatibilité (utilisé dans des endroits qui importent scoreAndSort)
export function scoreAndSort(
  restaurants: Restaurant[],
  prefs?: UserPrefs
): ScoredRestaurant[] {
  return buildCuratedSelection(restaurants, prefs);
}
