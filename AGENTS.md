=Opla — Document d'Architecture Technique

> Version 1.0 — MVP — Usage Agentic

---

## 0. Contexte & Objectif

**Nom du projet :** Opla

**Type :** Progressive Web App (PWA) — Next.js

**Objectif MVP :** Valider si un utilisateur fait confiance à une recommandation automatique pour choisir où manger en moins de 10 secondes.

**Développeur :** Solo, profil Next.js / React / TypeScript / UI-UX

**Deadline :** MVP en 2–3 semaines

---

## 1. Stack Technique

| Couche          | Technologie                                       | Justification                                   |
| --------------- | ------------------------------------------------- | ----------------------------------------------- |
| Frontend        | Next.js 14 (App Router) + TypeScript              | Maîtrisé, SSR, déploiement Vercel trivial       |
| Styling         | Tailwind CSS v3                                   | Rapidité, pas de CSS custom                     |
| Base de données | Supabase (PostgreSQL)                             | Cache API, free tier, dashboard lisible         |
| API Restaurants | OpenStreetMap + Overpass API                      | 100% gratuit, couverture Paris excellente       |
| API Notes       | TripAdvisor Content API                           | Seule source gratuite avec notes FR fiables     |
| Géolocalisation | Browser Geolocation API (`navigator.geolocation`) | Suffisant en web, pas de lib externe            |
| Analytics       | Posthog                                           | Event tracking précis, free tier, self-hostable |
| PWA             | `next-pwa`                                        | Icône écran d'accueil, comportement natif       |
| Déploiement     | Vercel                                            | Zéro config avec Next.js                        |
| Auth            | Aucune — UUID anonyme en cookie                   | Zéro friction, suffisant pour le MVP            |

---

## 2. Architecture Globale

```
[Utilisateur Mobile / Desktop]
         │
         ▼
[Next.js App — Vercel]
         │
         ├─► Browser Geolocation API
         │         └─► lat / lng
         │
         ├─► /api/restaurants (Next.js API Route)
         │         ├─► Supabase cache (TTL 24h, clé = geohash)
         │         │       └─► HIT → retourne données cachées
         │         │
         │         └─► MISS →
         │                 ├─► Overpass API (OSM) → liste restaurants
         │                 └─► TripAdvisor Content API → notes
         │                         └─► merge + score + save Supabase
         │
         ├─► Scoring (server-side dans API Route)
         │         └─► Today's Pick + Top 5 calculés
         │
         └─► Posthog (client-side)
                   └─► events : page_view, pick_clicked, top5_clicked, maps_opened
```

---

## 3. Structure du Projet

```
opla/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  ← Layout global, Posthog provider
│   │   ├── page.tsx                    ← Page principale (géoloc + affichage)
│   │   ├── loading.tsx                 ← Skeleton loader
│   │   └── api/
│   │       └── restaurants/
│   │           └── route.ts            ← API Route principale (OSM + TripAdvisor + cache)
│   │
│   ├── components/
│   │   ├── TodaysPick.tsx              ← Card recommandation principale
│   │   ├── TopFive.tsx                 ← Liste des 5 restaurants
│   │   ├── RestaurantCard.tsx          ← Card générique réutilisable
│   │   ├── ReasonBadge.tsx             ← Badge "Proche de vous", "Bien noté", etc.
│   │   ├── LocationGate.tsx            ← Gestion refus / attente géoloc
│   │   └── MapButton.tsx               ← Bouton redirection Google Maps
│   │
│   ├── lib/
│   │   ├── overpass.ts                 ← Client Overpass API (OSM)
│   │   ├── tripadvisor.ts              ← Client TripAdvisor Content API
│   │   ├── scoring.ts                  ← Algorithme de scoring et sélection
│   │   ├── cache.ts                    ← Logique cache Supabase (read/write/TTL)
│   │   ├── supabase.ts                 ← Initialisation client Supabase
│   │   ├── geohash.ts                  ← Encodage lat/lng en geohash (précision 5)
│   │   └── analytics.ts                ← Wrapper Posthog (trackEvent)
│   │
│   ├── hooks/
│   │   ├── useGeolocation.ts           ← Hook géolocalisation browser
│   │   └── useAnonymousId.ts           ← Hook UUID anonyme (cookie persistant)
│   │
│   └── types/
│       └── restaurant.ts               ← Types TypeScript partagés
│
├── public/
│   ├── manifest.json                   ← PWA manifest
│   └── icons/                          ← Icônes PWA (192x192, 512x512)
│
├── .env.local                          ← Variables d'environnement locales
├── .env.example                        ← Template variables (commité)
├── next.config.js                      ← Config Next.js + next-pwa
└── package.json
```

---

## 4. Types TypeScript (`src/types/restaurant.ts`)

```tsx
export type Restaurant = {
  id: string; // ID unique OSM ou TripAdvisor
  name: string;
  lat: number;
  lng: number;
  address: string;
  cuisine: string | null; // ex: "italian", "french", "japanese"
  opening_hours: string | null; // format OSM brut
  phone: string | null;
  website: string | null;
  rating: number | null; // 0–5, source TripAdvisor
  rating_count: number | null; // Nombre d'avis TripAdvisor
  osm_tags_count: number; // Proxy de complétude OSM
  distance_meters: number; // Calculé à partir de lat/lng user
  reason: RecommendationReason; // Raison d'affichage
};

export type RecommendationReason =
  | "closest" // Proche de vous
  | "top_rated" // Très bien noté
  | "well_referenced" // Bien référencé près de vous
  | "weather_match" // Adapté à la météo (V2)
  | "never_tried"; // Jamais testé (V2 — nécessite historique)

export type ScoredRestaurant = Restaurant & {
  score: number;
};

export type ApiResponse = {
  todaysPick: Restaurant;
  topFive: Restaurant[];
  fetchedAt: string;
  fromCache: boolean;
};
```

---

## 5. API Route — `/api/restaurants/route.ts`

### Comportement

```
GET /api/restaurants?lat=48.8566&lng=2.3522

1. Encoder lat/lng en geohash (précision 5 = ~5km)
2. Chercher dans Supabase : SELECT * FROM restaurants_cache WHERE geohash = ? AND fetched_at > NOW() - INTERVAL '24 hours'
3. Si HIT → retourner les données cachées
4. Si MISS :
   a. Appeler Overpass API → restaurants dans rayon 1000m
   b. Pour chaque restaurant, appeler TripAdvisor → note (avec rate limiting)
   c. Merger les données
   d. Appliquer le scoring
   e. Sauvegarder dans Supabase
   f. Retourner ApiResponse
```

### Paramètres

| Param    | Type  | Requis | Description                    |
| -------- | ----- | ------ | ------------------------------ |
| `lat`    | float | ✅     | Latitude utilisateur           |
| `lng`    | float | ✅     | Longitude utilisateur          |
| `radius` | int   | ❌     | Rayon en mètres (défaut: 1000) |

### Réponse

```json
{
  "todaysPick": { ...Restaurant },
  "topFive": [ ...Restaurant[] ],
  "fetchedAt": "2024-01-15T12:00:00Z",
  "fromCache": true
}
```

---

## 6. Algorithme de Scoring (`src/lib/scoring.ts`)

### Formule

```
score = (note_normalisée × 0.5) + (proximité_normalisée × 0.35) + (complétude_osm × 0.15)
```

### Détail des composantes

| Composante             | Poids | Calcul                                  |
| ---------------------- | ----- | --------------------------------------- |
| `note_normalisée`      | 50%   | `rating / 5` — si null : `0.5` (neutre) |
| `proximité_normalisée` | 35%   | `1 - (distance / max_distance)`         |
| `complétude_osm`       | 15%   | `min(osm_tags_count / 10, 1)`           |

### Assignation des raisons

```
si rating >= 4.5 ET rating_count >= 50 → "top_rated"
sinon si distance < 200m → "closest"
sinon si osm_tags_count >= 8 → "well_referenced"
sinon → "closest"
```

---

## 7. Base de Données Supabase

### Table `restaurants_cache`

```sql
CREATE TABLE restaurants_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geohash     TEXT NOT NULL,
  data        JSONB NOT NULL,          -- ApiResponse complète sérialisée
  fetched_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_cache_geohash ON restaurants_cache(geohash);
CREATE INDEX idx_restaurants_cache_fetched_at ON restaurants_cache(fetched_at);
```

### Table `user_events` (optionnel — Posthog suffit pour le MVP)

```sql
CREATE TABLE user_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id  TEXT NOT NULL,
  event_type    TEXT NOT NULL,     -- 'pick_clicked', 'top5_clicked', 'maps_opened'
  restaurant_id TEXT,
  geohash       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Intégrations Externes

### 8.1 Overpass API (OSM)

**Endpoint :** `https://overpass-api.de/api/interpreter`

**Méthode :** POST

**Requête Overpass QL :**

```
[out:json][timeout:10];
node"amenity"="restaurant";
out body;
```

**Champs extraits :** `id`, `lat`, `lon`, `tags.name`, `tags.cuisine`, `tags.opening_hours`, `tags.phone`, `tags.website`, `tags["addr:street"]`

**Limites :** Pas de quota strict. Respecter un délai de 1s entre les requêtes massives.

---

### 8.2 TripAdvisor Content API

**Base URL :** `https://api.content.tripadvisor.com/api/v1`

**Auth :** Header `X-TripAdvisor-API-Key`

**Endpoint utilisé :** `GET /location/search?searchQuery={name}&latLong={lat},{lng}&category=restaurants`

**Puis :** `GET /location/{locationId}/details`

**Champs extraits :** `rating`, `num_reviews`

**Limites :** À vérifier selon plan approuvé. Toujours passer par le cache Supabase pour éviter les appels répétés.

---

### 8.3 Google Maps (redirection uniquement)

Pas d'API appelée. Simple lien de redirection :

```
https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&travelmode=walking
```

---

### 8.4 Posthog Analytics

**Initialisation :** Dans `layout.tsx` côté client

**Events à tracker :**

| Event              | Propriétés                            | Déclencheur                |
| ------------------ | ------------------------------------- | -------------------------- |
| `page_view`        | `anonymous_id`, `geohash`             | Chargement page            |
| `location_granted` | `anonymous_id`                        | Permission géoloc acceptée |
| `location_denied`  | —                                     | Permission géoloc refusée  |
| `pick_clicked`     | `restaurant_id`, `reason`, `score`    | Clic Today's Pick          |
| `top5_clicked`     | `restaurant_id`, `position`, `reason` | Clic dans le Top 5         |
| `maps_opened`      | `restaurant_id`                       | Clic bouton Y aller        |
| `results_loaded`   | `from_cache`, `duration_ms`           | Résultats affichés         |

---

## 9. Gestion de l'Identité Anonyme (`src/hooks/useAnonymousId.ts`)

```
1. Au premier chargement : vérifier cookie "rf_uid"
2. Si absent : générer UUID v4, écrire cookie (expires: 1 an)
3. Retourner l'UUID dans tous les events Posthog
```

Pas de localStorage (PWA offline risk). Cookie HTTP uniquement.

---

## 10. PWA Configuration

**`public/manifest.json` :**

```json
{
  "name": "Opla",
  "short_name": "Opla",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**`next.config.js` :**

```jsx
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  /* next config */
});
```

---

## 11. Variables d'Environnement

### `.env.example`

```
# TripAdvisor
TRIPADVISOR_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Uniquement côté serveur (API Routes)

# Posthog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> Les variables préfixées `NEXT_PUBLIC_` sont exposées côté client.
>
> `TRIPADVISOR_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` ne doivent jamais être exposées côté client.

---

## 12. Contraintes & Règles Absolues

### Sécurité

- Les clés API TripAdvisor et Supabase Service Role ne doivent **jamais** apparaître dans le code client
- Toutes les requêtes vers Overpass et TripAdvisor passent **exclusivement** par les API Routes Next.js

### Performance

- Timeout Overpass : 10 secondes max
- Timeout TripAdvisor : 5 secondes max par requête
- Si TripAdvisor timeout → continuer sans note (rating = null, reason = "well_referenced")
- Le cache Supabase est obligatoire avant tout appel externe

### Scoring

- Le scoring est calculé **côté serveur** dans l'API Route
- Le client reçoit uniquement les données finales triées
- Today's Pick = restaurant avec le score le plus élevé
- Top 5 = restaurants du rang 2 au rang 6

### UX

- La géolocalisation doit être demandée **après** une action utilisateur explicite, pas au chargement automatique
- Afficher un skeleton loader pendant le fetch
- Le bouton "Y aller" ouvre Google Maps dans un nouvel onglet

### Ce qui est hors scope MVP

- Authentification utilisateur
- Historique de visites
- Filtres cuisine / prix
- Réservation / commande
- Moteur de recommandation ML
- Notifications push
- Mode offline avancé

---

## 13. Commandes de Setup

```bash
# Dépendances
npm install @supabase/supabase-js posthog-js next-pwa uuid
npm install -D @types/uuid

# Déploiement initial
vercel
```

---

## 14. UI Couleur / Direction Artistique

**Font** : SF Pro Display / SF Pro Rounded

**Accent Color : #8AD384**

**Background Color** : **#FEFDFE**

**Background Section Accent Color :** Gradient (#**2C3035** → #**26292F** avec petit symbole dedans)

**Border :** Menu flottant avec border Arrondi

**Header** : Placé en bas flottant, border arrondi avec 3 boutons (Home, Find A Place - Bouton accentué, Profile)
