"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import { trackEvent } from "@/lib/analytics";
import type { ApiResponse } from "@/types/restaurant";

export type RestaurantsState =
  | "idle"
  | "locating"
  | "loading"
  | "success"
  | "error";

export function useRestaurants(autoFetch = false) {
  const [state, setState] = useState<RestaurantsState>("idle");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user } = useAuth();
  const { profile } = useProfile(user);
  const { requestLocation } = useGeolocation();
  const anonymousId = useAnonymousId();

  // Ref pour éviter le double-fetch en StrictMode et les re-renders
  const fetchedRef = useRef(false);

  const load = useCallback(async () => {
    setState("locating");
    setErrorMsg(null);

    let coords: { lat: number; lng: number };

    try {
      coords = await requestLocation();
    } catch {
      setState("error");
      setErrorMsg(
        "Géolocalisation refusée. Active la localisation pour continuer.",
      );
      trackEvent("location_denied");
      return;
    }

    trackEvent("location_granted");
    setState("loading");

    const startMs = Date.now();

    try {
      // Construire les query params avec les préférences du profil
      const params = new URLSearchParams({
        lat: String(coords.lat),
        lng: String(coords.lng),
      });

      if (profile) {
        if (profile.max_distance) {
          params.set("radius", String(profile.max_distance));
        }
        if (profile.cuisines?.length) {
          params.set("cuisines", profile.cuisines.join(","));
        }
        if (profile.venue_types?.length) {
          params.set("venue_types", profile.venue_types.join(","));
        }
        if (profile.price_levels?.length) {
          params.set("price_levels", profile.price_levels.join(","));
        }
      }

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
          : "Impossible de charger les restaurants.",
      );
    }
  }, [requestLocation, profile]);

  useEffect(() => {
    if (!autoFetch) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    load();
  }, [autoFetch, load]);

  return { state, data, errorMsg, load, user, anonymousId };
}
