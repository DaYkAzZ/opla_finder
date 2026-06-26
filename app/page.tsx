"use client";

import { useRestaurants } from "@/hooks/useRestaurants";
import { allRestaurants, sortByRating } from "@/lib/restaurants";
import PageHeader from "@/components/PageHeader";
import TopRatedCarousel from "@/components/TopRatedCarousel";
import TopFiveCta from "@/components/TopFiveCta";
import PageLoader from "@/components/PageLoader";
import LocationGate from "@/components/LocationGate";

export default function HomePage() {
  const { state, data, errorMsg, load } = useRestaurants(true);

  if (state === "locating") {
    return <LocationGate status="waiting" />;
  }

  if (state === "loading" || state === "idle") {
    return <PageLoader message="Recherche autour de toi" />;
  }

  if (state === "error") {
    return (
      <div className="center-state">
        <p className="center-state__text">
          {errorMsg ?? "Une erreur est survenue."}
        </p>
        <button type="button" className="btn btn-primary" onClick={load}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return null;

  const topRated = sortByRating(allRestaurants(data));

  return (
    <div className="page">
      <PageHeader />

      <TopFiveCta />

      <section>
        <p className="section-label">Les mieux notés autour de toi</p>
        <TopRatedCarousel restaurants={topRated} />
      </section>
    </div>
  );
}
