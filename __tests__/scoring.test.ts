import { buildCuratedSelection, matchesPrefs } from "@/lib/scoring";
import type { Restaurant } from "@/types/restaurant";
import type { UserPrefs } from "@/lib/scoring";

// ── Factories ─────────────────────────────────────────────────────────────────

function makeRestaurant(overrides: Partial<Restaurant> & { id: string }): Restaurant {
  return {
    name: `Restaurant ${overrides.id}`,
    lat: 48.85,
    lng: 2.35,
    address: "1 rue de la Paix",
    cuisine: null,
    venue_type: "restaurant",
    opening_hours: null,
    phone: null,
    website: null,
    rating: null,
    rating_count: null,
    osm_tags_count: 5,
    distance_meters: 300,
    reason: "closest",
    ...overrides,
  };
}

// Pool de 15 restaurants réalistes pour les tests
function makePool(): Restaurant[] {
  return [
    // Matches cuisine "japanese" + venue "restaurant"
    makeRestaurant({ id: "r1", cuisine: "japanese", venue_type: "restaurant", rating: 4.2, distance_meters: 150 }),
    makeRestaurant({ id: "r2", cuisine: "sushi", venue_type: "restaurant", rating: 4.0, distance_meters: 250 }),
    makeRestaurant({ id: "r3", cuisine: "japanese", venue_type: "restaurant", rating: 3.8, distance_meters: 400 }),
    makeRestaurant({ id: "r4", cuisine: "japanese", venue_type: "restaurant", rating: 3.5, distance_meters: 600 }),
    // Match venue "bar" seulement
    makeRestaurant({ id: "r5", cuisine: "french", venue_type: "bar", rating: 4.1, distance_meters: 200 }),
    // Non-matches, bien notés
    makeRestaurant({ id: "r6", cuisine: "italian", venue_type: "restaurant", rating: 4.7, rating_count: 120, distance_meters: 300 }),
    makeRestaurant({ id: "r7", cuisine: "french", venue_type: "brasserie", rating: 4.5, rating_count: 80, distance_meters: 350 }),
    makeRestaurant({ id: "r8", cuisine: "mexican", venue_type: "restaurant", rating: 4.3, distance_meters: 500 }),
    // Non-matches, notes moyennes/basses → candidats découverte
    makeRestaurant({ id: "r9", cuisine: "chinese", venue_type: "restaurant", rating: 3.2, distance_meters: 450 }),
    makeRestaurant({ id: "r10", cuisine: "indian", venue_type: "fast_food", rating: 3.0, distance_meters: 550 }),
    makeRestaurant({ id: "r11", cuisine: "thai", venue_type: "restaurant", rating: 3.4, distance_meters: 480 }),
    makeRestaurant({ id: "r12", cuisine: "burger", venue_type: "fast_food", rating: null, distance_meters: 620 }),
    makeRestaurant({ id: "r13", cuisine: "pizza", venue_type: "restaurant", rating: 3.6, distance_meters: 700 }),
    makeRestaurant({ id: "r14", cuisine: "kebab", venue_type: "fast_food", rating: 2.8, distance_meters: 750 }),
    makeRestaurant({ id: "r15", cuisine: "vegan", venue_type: "cafe", rating: 4.4, distance_meters: 550 }),
  ];
}

const prefs: UserPrefs = {
  cuisines: ["japanese", "sushi"],
  venue_types: ["restaurant", "bar"],
  price_levels: [],
};

// ── matchesPrefs ──────────────────────────────────────────────────────────────

describe("matchesPrefs", () => {
  it("retourne true si la cuisine matche", () => {
    const r = makeRestaurant({ id: "x", cuisine: "japanese", venue_type: "brasserie" });
    expect(matchesPrefs(r, prefs)).toBe(true);
  });

  it("retourne true si le venue_type matche (même si cuisine ne matche pas)", () => {
    const r = makeRestaurant({ id: "x", cuisine: "french", venue_type: "bar" });
    expect(matchesPrefs(r, prefs)).toBe(true);
  });

  it("retourne false si ni cuisine ni venue ne matchent", () => {
    const r = makeRestaurant({ id: "x", cuisine: "italian", venue_type: "brasserie" });
    expect(matchesPrefs(r, prefs)).toBe(false);
  });

  it("retourne false si cuisine est null et venue ne matche pas", () => {
    const r = makeRestaurant({ id: "x", cuisine: null, venue_type: "cafe" });
    expect(matchesPrefs(r, prefs)).toBe(false);
  });

  it("supporte les cuisines multiples OSM séparées par ;", () => {
    const r = makeRestaurant({ id: "x", cuisine: "french;japanese", venue_type: "cafe" });
    expect(matchesPrefs(r, prefs)).toBe(true);
  });
});

// ── buildCuratedSelection — sans prefs ───────────────────────────────────────

describe("buildCuratedSelection — sans prefs", () => {
  const pool = makePool();

  it("retourne 6 restaurants maximum", () => {
    const result = buildCuratedSelection(pool);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("retourne 0 si le pool est vide", () => {
    expect(buildCuratedSelection([])).toHaveLength(0);
  });

  it("trie par score décroissant", () => {
    const result = buildCuratedSelection(pool);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
    }
  });

  it("tous les restaurants ont un score entre 0 et 1", () => {
    const result = buildCuratedSelection(pool);
    result.forEach((r) => {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    });
  });

  it("pas de doublons dans la sélection", () => {
    const result = buildCuratedSelection(pool);
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── buildCuratedSelection — avec prefs ───────────────────────────────────────

describe("buildCuratedSelection — avec prefs", () => {
  const pool = makePool();

  it("retourne exactement 6 restaurants quand le pool est suffisant", () => {
    const result = buildCuratedSelection(pool, prefs);
    expect(result).toHaveLength(6);
  });

  it("slot 0 (todaysPick) : matche les prefs", () => {
    const result = buildCuratedSelection(pool, prefs);
    expect(matchesPrefs(result[0], prefs)).toBe(true);
  });

  it("slots 1-3 : 3 restaurants qui matchent les prefs", () => {
    const result = buildCuratedSelection(pool, prefs);
    const matchSlots = result.slice(1, 4);
    matchSlots.forEach((r) => {
      expect(matchesPrefs(r, prefs)).toBe(true);
    });
  });

  it("slot 4 : ne matche pas les prefs et a reason='top_rated'", () => {
    const result = buildCuratedSelection(pool, prefs);
    const topRated = result[4];
    expect(matchesPrefs(topRated, prefs)).toBe(false);
    expect(topRated.reason).toBe("top_rated");
  });

  it("slot 5 : ne matche pas les prefs et a reason='never_tried'", () => {
    const result = buildCuratedSelection(pool, prefs);
    const discovery = result[5];
    expect(matchesPrefs(discovery, prefs)).toBe(false);
    expect(discovery.reason).toBe("never_tried");
  });

  it("pas de doublons dans la sélection", () => {
    const result = buildCuratedSelection(pool, prefs);
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("slot 4 et slot 5 sont deux restaurants différents", () => {
    const result = buildCuratedSelection(pool, prefs);
    expect(result[4].id).not.toBe(result[5].id);
  });

  it("le slot top_rated a la note la plus haute parmi les non-matches", () => {
    const result = buildCuratedSelection(pool, prefs);
    const topRated = result[4];
    const nonMatches = pool.filter((r) => !matchesPrefs(r, prefs));
    const highestRatedNonMatch = nonMatches
      .filter((r) => r.rating !== null)
      .reduce((best, r) => (r.rating! > (best.rating ?? 0) ? r : best));
    expect(topRated.id).toBe(highestRatedNonMatch.id);
  });
});

// ── buildCuratedSelection — cas limites ───────────────────────────────────────

describe("buildCuratedSelection — cas limites", () => {
  it("pool de 1 restaurant : retourne 1 résultat", () => {
    const pool = [makeRestaurant({ id: "only", cuisine: "japanese", venue_type: "restaurant" })];
    const result = buildCuratedSelection(pool, prefs);
    expect(result).toHaveLength(1);
  });

  it("pas assez de matches : complète avec les meilleurs disponibles", () => {
    // Pool avec seulement 1 match
    const pool = [
      makeRestaurant({ id: "m1", cuisine: "japanese", venue_type: "restaurant", rating: 4.0, distance_meters: 200 }),
      makeRestaurant({ id: "nm1", cuisine: "italian", venue_type: "brasserie", rating: 4.5, rating_count: 100, distance_meters: 300 }),
      makeRestaurant({ id: "nm2", cuisine: "french", venue_type: "bistro", rating: 3.5, distance_meters: 400 }),
      makeRestaurant({ id: "nm3", cuisine: "chinese", venue_type: "cafe", rating: 3.0, distance_meters: 500 }),
    ];
    const result = buildCuratedSelection(pool, prefs);
    // Pas de crash, pas de doublons
    expect(result.length).toBeGreaterThan(0);
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("prefs vides → comportement identique à sans prefs (tri par score)", () => {
    const pool = makePool();
    const emptyPrefs: UserPrefs = { cuisines: [], venue_types: [], price_levels: [] };
    const withEmpty = buildCuratedSelection(pool, emptyPrefs);
    const withoutPrefs = buildCuratedSelection(pool);
    expect(withEmpty.map((r) => r.id)).toEqual(withoutPrefs.map((r) => r.id));
  });

  it("tous les restaurants matchent les prefs : les slots top_rated et discovery sont remplis quand même", () => {
    // Tous les restaurants matchent "restaurant"
    const pool = Array.from({ length: 10 }, (_, i) =>
      makeRestaurant({
        id: `all-match-${i}`,
        cuisine: "japanese",
        venue_type: "restaurant",
        rating: 3 + i * 0.1,
        distance_meters: 100 + i * 50,
      })
    );
    const allMatchPrefs: UserPrefs = {
      cuisines: ["japanese"],
      venue_types: ["restaurant"],
      price_levels: [],
    };
    const result = buildCuratedSelection(pool, allMatchPrefs);
    expect(result).toHaveLength(6);
    // Pas de doublons
    const ids = result.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
