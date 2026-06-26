"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from '@/lib/analytics'
import ReasonBadge from "./ReasonBadge";
import MapButton from "./MapButton";

interface Props {
  restaurant: Restaurant;
  anonymousId: string;
}

export default function TodaysPick({ restaurant, anonymousId }: Props) {
  function handleClick() {
    trackEvent("pick_clicked", {
      restaurant_id: restaurant.id,
      reason: restaurant.reason,
      anonymous_id: anonymousId,
    });
  }

  const distanceLabel =
    restaurant.distance_meters < 1000
      ? `${Math.round(restaurant.distance_meters)} m`
      : `${(restaurant.distance_meters / 1000).toFixed(1)} km`;

  return (
    <div
      onClick={handleClick}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #2C3035 0%, #26292F 100%)",
        padding: "28px",
        minHeight: "220px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: "10px",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Symbole déco */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          opacity: 0.08,
          fontSize: "72px",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        ✦
      </div>

      <ReasonBadge reason={restaurant.reason} />

      <h2
        style={{
          margin: 0,
          fontSize: "26px",
          fontWeight: 700,
          color: "#FEFDFE",
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
        }}
      >
        {restaurant.name}
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {restaurant.cuisine && (
            <span
              style={{
                fontSize: "13px",
                color: "rgba(254,253,254,0.5)",
                textTransform: "capitalize",
              }}
            >
              {restaurant.cuisine.replace(/_/g, " ")}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "rgba(254,253,254,0.65)" }}>
              {distanceLabel}
            </span>
            {restaurant.rating !== null && (
              <span
                style={{ fontSize: "14px", color: "#8AD384", fontWeight: 600 }}
              >
                ★ {restaurant.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <MapButton restaurant={restaurant} />
      </div>
    </div>
  );
}
