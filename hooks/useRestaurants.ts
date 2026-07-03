"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { trackEvent } from "@/lib/analytics";
import type { ApiResponse } from "@/types/restaurant";
import type { UserProfile } from "@/types/profile";

export type RestaurantsState =
  | "idle"
  | "locating"
  | "loading"
  | "success"
  | "error";

function buildParams(
  coords: { lat: number; lng: number },
  profile: UserProfile | null
): URLSearchParams {
  const params = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
  });

  if (!profile) return params;

  if (profile.max_distance) params.set("radius", String(profile.max_distance));
  if (profile.cuisines?.length) params.set("cuisines", profile.cuisines.join(","));
  if (profile.venue_types?.length) params.set("venue_types", profile.venue_types.join(","));
  if (profile.price_levels?.length) params.set("price_levels", profile.price_levels.join(","));

  return params;
}

export function useRestaurants(autoFetch = false) {
  const [state, setState] = useState<RestaurantsState>("idle");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Coordonnées mises en cache pour pouvoir relancer sans re-géolocaliser
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const fetchedRef = useRef(false);

  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { requestLocation } = useGeolocation();

  // Fetch avec des coordonnées et un profil explicites (évite les stale closures)
  const fetchRestaurants = useCallback(
    async (
      coords: { lat: number; lng: number },
      currentProfile: UserProfile | null
    ) => {
      setState("loading");
      setErrorMsg(null);

      const startMs = Date.now();

      try {
        const params = buildParams(coords, currentProfile);
        const res = await fetch(`/api/restaurants?${params.toString()}`);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Erreur serveur");
        }

        const json: ApiResponse = await res.json();
        setData(json);
        setState("success");

        trackEvent("results_loaded", {
          from_cache: json.fromCache,
          duration_ms: Date.now() - startMs,
        });
      } catch (err) {
        console.error("[useRestaurants]", err);
        setState("error");
        setErrorMsg(
          err instanceof Error
            ? err.message
            : "Impossible de charger les restaurants."
        );
      }
    },
    [] // stable — les args sont passés explicitement
  );

  // Chargement initial : géolocalise puis fetch
  const load = useCallback(async () => {
    setState("locating");
    setErrorMsg(null);

    let coords: { lat: number; lng: number };

    try {
      coords = await requestLocation();
      coordsRef.current = coords;
    } catch {
      setState("error");
      setErrorMsg("Géolocalisation refusée. Active la localisation pour continuer.");
      trackEvent("location_denied");
      return;
    }

    trackEvent("location_granted");
    await fetchRestaurants(coords, profile);
  }, [requestLocation, profile, fetchRestaurants]);

  // Relancement à prefs changées : réutilise les coordonnées déjà connues
  const reloadWithNewPrefs = useCallback(
    async (updatedProfile: UserProfile) => {
      if (!coordsRef.current) {
        // Pas encore de coordonnées → on repart du début
        await load();
        return;
      }
      await fetchRestaurants(coordsRef.current, updatedProfile);
    },
    [fetchRestaurants, load]
  );

  // Auto-fetch au montage (page principale)
  useEffect(() => {
    if (!autoFetch) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, [autoFetch, load]);

  return { state, data, errorMsg, load, reloadWithNewPrefs, user };
}
