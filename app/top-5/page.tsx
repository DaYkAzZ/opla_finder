"use client";

import { useRestaurants } from "@/hooks/useRestaurants";
import PageHeader from "@/components/PageHeader";
import TodaysPick from "@/components/TodaysPick";
import TopFive from "@/components/TopFive";
import PageLoader from "@/components/PageLoader";
import LocationGate from "@/components/LocationGate";

export default function TopFivePage() {
  const { state, data, errorMsg, load, anonymousId } = useRestaurants(true);

  if (state === "locating") {
    return <LocationGate status="waiting" />;
  }

  if (state === "loading" || state === "idle") {
    return <PageLoader message="Chargement du Top 5" />;
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

  return (
    <div className="page">
      <PageHeader
        title="Top 5"
        subtitle="Sélectionnés pour toi, maintenant"
      />

      <TodaysPick restaurant={data.todaysPick} anonymousId={anonymousId} />

      <section style={{ marginTop: "24px" }}>
        <h2 className="section-title">Autour de toi</h2>
        <TopFive restaurants={data.topFive} anonymousId={anonymousId} />
      </section>

      <p className="meta-text" style={{ marginTop: "24px" }}>
        {data.fromCache ? "Cache · " : "Frais · "}
        {new Date(data.fetchedAt).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
