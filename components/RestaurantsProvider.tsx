"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRestaurants, RestaurantsState } from "@/hooks/useRestaurants";
import type { ApiResponse } from "@/types/restaurant";
import type { UserProfile } from "@/types/profile";

interface RestaurantsContextValue {
  state: RestaurantsState;
  data: ApiResponse | null;
  errorMsg: string | null;
  load: () => Promise<void>;
  reloadWithNewPrefs: (profile: UserProfile) => Promise<void>;
}

const RestaurantsContext = createContext<RestaurantsContextValue | null>(null);

export function RestaurantsProvider({ children }: { children: ReactNode }) {
  const value = useRestaurants(false); // autoFetch = false, la page gère le déclenchement

  return (
    <RestaurantsContext.Provider value={value}>
      {children}
    </RestaurantsContext.Provider>
  );
}

export function useRestaurantsContext(): RestaurantsContextValue {
  const ctx = useContext(RestaurantsContext);
  if (!ctx) {
    throw new Error("useRestaurantsContext doit être utilisé dans <RestaurantsProvider>");
  }
  return ctx;
}
