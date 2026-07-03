-- Migration : remplace la colonne geohash par cache_key
-- À exécuter dans le SQL Editor de ton dashboard Supabase

-- 1. Vider le cache existant (les anciennes entrées ont la mauvaise clé)
TRUNCATE TABLE restaurants_cache;

-- 2. Renommer la colonne geohash → cache_key
ALTER TABLE restaurants_cache RENAME COLUMN geohash TO cache_key;

-- 3. Recréer l'index sur la nouvelle colonne
DROP INDEX IF EXISTS idx_restaurants_cache_geohash;
CREATE INDEX idx_restaurants_cache_cache_key ON restaurants_cache(cache_key);
CREATE INDEX idx_restaurants_cache_fetched_at ON restaurants_cache(fetched_at);
