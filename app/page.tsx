"use client";

import { useState, useCallback } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import { trackEvent } from '@/lib/analytics'
import TodaysPick from "@/components/TodaysPick";
import TopFive from "@/components/TopFive";
import LocationGate from "@/components/LocationGate";
import type { ApiResponse } from "@/types/restaurant";

type PageState = "idle" | "locating" | "loading" | "success" | "error";

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const anonymousId = useAnonymousId();
  const { requestLocation } = useGeolocation();

  const handleFindPlace = useCallback(async () => {
    setPageState("locating");
    setErrorMsg(null);

    let coords: { lat: number; lng: number };

    try {
      coords = await requestLocation();
    } catch {
      setPageState("error");
      setErrorMsg(
        "Géolocalisation refusée. Active la localisation pour continuer.",
      );
      trackEvent("location_denied");
      return;
    }

    trackEvent("location_granted", { anonymous_id: anonymousId });
    setPageState("loading");

    const startMs = Date.now();

    try {
      const res = await fetch(
        `/api/restaurants?lat=${coords.lat}&lng=${coords.lng}`,
      );
      if (!res.ok) throw new Error("Erreur serveur");

      const json: ApiResponse = await res.json();
      setData(json);
      setPageState("success");

      trackEvent("results_loaded", {
        from_cache: json.fromCache,
        duration_ms: Date.now() - startMs,
      });
    } catch {
      setPageState("error");
      setErrorMsg("Impossible de charger les restaurants. Réessaie.");
    }
  }, [anonymousId, requestLocation]);

  /* ── IDLE ─────────────────────────────────────────────────────── */
  if (pageState === "idle") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          gap: "32px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: 700,
              letterSpacing: "-2px",
              margin: 0,
              color: "#1A1A1A",
            }}
          >
            opla
          </h1>
          <p
            style={{
              marginTop: "12px",
              fontSize: "17px",
              color: "#6B6B6B",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Où manger maintenant,
            <br />
            décidé en{" "}
            <span style={{ color: "#8AD384", fontWeight: 600 }}>
              10 secondes.
            </span>
          </p>
        </div>

        <button
          onClick={handleFindPlace}
          style={{
            backgroundColor: "#8AD384",
            color: "#1A1A1A",
            border: "none",
            borderRadius: "100px",
            padding: "16px 40px",
            fontSize: "17px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(138,211,132,0.35)",
          }}
        >
          Trouve-moi un resto
        </button>
      </div>
    );
  }

  /* ── LOCATING ─────────────────────────────────────────────────── */
  if (pageState === "locating") {
    return <LocationGate status="waiting" />;
  }

  /* ── LOADING ──────────────────────────────────────────────────── */
  if (pageState === "loading") {
    return <SkeletonLoader />;
  }

  /* ── ERROR ────────────────────────────────────────────────────── */
  if (pageState === "error") {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          gap: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "17px", color: "#6B6B6B" }}>
          {errorMsg ?? "Une erreur est survenue."}
        </p>
        <button
          onClick={handleFindPlace}
          style={{
            backgroundColor: "#8AD384",
            color: "#1A1A1A",
            border: "none",
            borderRadius: "100px",
            padding: "14px 32px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  /* ── SUCCESS ──────────────────────────────────────────────────── */
  if (pageState === "success" && data) {
    return (
      <div
        style={{ padding: "24px 16px", maxWidth: "480px", margin: "0 auto" }}
      >
        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#8AD384",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            Le choix du moment
          </p>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              margin: 0,
              color: "#1A1A1A",
            }}
          >
            Pour toi, maintenant
          </h2>
        </div>

        <TodaysPick restaurant={data.todaysPick} anonymousId={anonymousId} />

        <div style={{ marginTop: "32px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#8AD384",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            Autour de toi
          </p>
          <h3
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.3px",
              margin: "0 0 16px",
              color: "#1A1A1A",
            }}
          >
            Top 5
          </h3>
          <TopFive restaurants={data.topFive} anonymousId={anonymousId} />
        </div>

        <p
          style={{
            marginTop: "32px",
            fontSize: "12px",
            color: "#ABABAB",
            textAlign: "center",
          }}
        >
          {data.fromCache ? "Données en cache · " : "Données fraîches · "}
          {new Date(data.fetchedAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    );
  }

  return null;
}

function SkeletonLoader() {
  return (
    <div style={{ padding: "24px 16px", maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            width: "120px",
            height: "12px",
            borderRadius: "6px",
            backgroundColor: "#EBEBEB",
            marginBottom: "8px",
          }}
        />
        <div
          style={{
            width: "200px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#EBEBEB",
          }}
        />
      </div>

      <div
        style={{
          borderRadius: "20px",
          background: "linear-gradient(135deg, #2C3035, #26292F)",
          padding: "28px",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "24px",
            borderRadius: "100px",
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
        <div
          style={{
            width: "65%",
            height: "30px",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
        <div
          style={{
            width: "45%",
            height: "16px",
            borderRadius: "6px",
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "72px",
              borderRadius: "16px",
              backgroundColor: "#EBEBEB",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        div[style*="EBEBEB"], div[style*="rgba(255"] { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
