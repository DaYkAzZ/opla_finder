"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from '@/lib/analytics'

interface Props {
  restaurant: Restaurant;
  small?: boolean;
}

export default function MapButton({ restaurant, small = false }: Props) {
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    trackEvent("maps_opened", { restaurant_id: restaurant.id });
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (small) {
    return (
      <button
        onClick={handleClick}
        style={{
          backgroundColor: "#8AD384",
          border: "none",
          borderRadius: "10px",
          padding: "8px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        aria-label={`Y aller — ${restaurant.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: "#8AD384",
        border: "none",
        borderRadius: "100px",
        padding: "10px 18px",
        fontSize: "14px",
        fontWeight: 600,
        color: "#1A1A1A",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        flexShrink: 0,
        boxShadow: "0 2px 12px rgba(138,211,132,0.3)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
          fill="currentColor"
        />
      </svg>
      Y aller
    </button>
  );
}
