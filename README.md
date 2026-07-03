# Opla

Opla est une Progressive Web App Next.js qui aide l’utilisateur à choisir rapidement un restaurant à proximité. L’application combine la géolocalisation, les données OpenStreetMap et une sélection personnalisée basée sur les préférences d’onboarding pour proposer un restaurant principal et un top 5 adapté.

## Fonctionnalités

- Onboarding avec sélection de préférences : cuisines, types de lieu, niveaux de prix et distance.
- Recherche de restaurants OSM via Overpass et enrichissement des données avec TripAdvisor.
- Matching des résultats aux préférences utilisateur.
- Top 5 composé de :
  - 3 restaurants en accord avec les critères,
  - 1 restaurant bien noté hors critères,
  - 1 restaurant découverte.
- Affichage d’images de restaurant via Google Places si une clé API est configurée.
- Caching Supabase optionnel pour réduire les appels externes.

## Structure du projet

- `app/` : pages et routes Next.js App Router.
- `app/api/restaurants/route.ts` : API route principale pour récupérer les restaurants.
- `components/` : UI composables comme `RestaurantCard`, `TopFive`, `TodaysPick`, `LocationGate`.
- `hooks/` : hooks React (`useRestaurants`, `useGeolocation`, `useAnonymousId`, etc.).
- `lib/` : logique métier, clients Overpass, TripAdvisor, Google Maps, scoring et cache.
- `types/` : types TypeScript partagés.

## Installation

```bash
npm install
```

## Exécution en développement

```bash
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.

## Tests

- Exécuter les tests :

```bash
npm test
```

- Exécuter les tests en watch :

```bash
npm run test:watch
```

- Générer le coverage :

```bash
npm run test:coverage
```

## Variables d’environnement

Créez un fichier `.env.local` à la racine et ajoutez :

```dotenv

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> `TRIPADVISOR_API_KEY` et `SUPABASE_SERVICE_ROLE_KEY` ne doivent jamais être exposés côté client.

## Bonnes pratiques

- Ne lancez pas `useRestaurants` automatiquement sans permission de localisation.
- Privilégiez le cache Supabase pour réduire les appels à Overpass et TripAdvisor.
- Pour obtenir des images, configurez `GOOGLE_MAPS_API_KEY` et `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

## Déploiement

Ce projet est conçu pour être déployé facilement sur Vercel avec Next.js.

## Remarques

- L’app fait du fallback si Overpass est indisponible.
- Le top 5 est construit pour équilibrer pertinence et découverte.
- Le scoring est calculé côté serveur et renvoie le meilleur restaurant pour `todaysPick`.
