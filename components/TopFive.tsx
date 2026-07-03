"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from "@/lib/analytics";
import { formatDistance } from "@/lib/restaurants";
import SlotBadge from "@/components/SlotBadge";

const VENUE_LABELS: Record<string, string> = {
  restaurant: "Restaurant", bar: "Bar", cafe: "Café",
  fast_food: "Fast-food", bistro: "Bistro", brasserie: "Brasserie",
};

const CUISINE_LABELS: Record<string, string> = {
  french: "Français", italian: "Italien", japanese: "Japonais",
  sushi: "Sushi", burger: "Burger", pizza: "Pizza", chinese: "Chinois",
  thai: "Thaï", indian: "Indien", mexican: "Mexicain",
  mediterranean: "Méditerranéen", vietnamese: "Vietnamien",
  kebab: "Kebab", vegan: "Végétalien", seafood: "Fruits de mer",
};

const THUMB_FALLBACKS = [
  "card-row__thumb--1", "card-row__thumb--2",
  "card-row__thumb--3", "card-row__thumb--4",
] as const;

function thumbFallback(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 4;
  return THUMB_FALLBACKS[hash];
}

function buildTag(restaurant: Restaurant): string | null {
  if (restaurant.cuisine) {
    const first = restaurant.cuisine.split(";")[0].trim();
    return CUISINE_LABELS[first] ?? first.replace(/_/g, " ");
  }
  if (restaurant.venue_type) return VENUE_LABELS[restaurant.venue_type] ?? null;
  return null;
}

interface Props {
  restaurants: Restaurant[];
  anonymousId: string;
}

export default function TopFive({ restaurants, anonymousId }: Props) {
  if (restaurants.length === 0) {
    return <p className="empty-text">Pas d&apos;autres restaurants à proximité.</p>;
  }

  return (
    <div className="card-list">
      {restaurants.map((restaurant, index) => (
        <RestaurantRow
          key={restaurant.id}
          restaurant={restaurant}
          // position globale : topFive commence à index 1 (0 = todaysPick)
          globalPosition={index + 1}
          anonymousId={anonymousId}
        />
      ))}
    </div>
  );
}

function RestaurantRow({
  restaurant,
  globalPosition,
  anonymousId,
}: {
  restaurant: Restaurant;
  globalPosition: number;
  anonymousId: string;
}) {
  const tag = buildTag(restaurant);
  const hasImage = !!restaurant.image_url;
  const thumbClass = hasImage ? "card-row__thumb--has-image" : thumbFallback(restaurant.id);

  function handleClick() {
    trackEvent("top5_clicked", {
      restaurant_id: restaurant.id,
      position: globalPosition,
      reason: restaurant.reason,
      anonymous_id: anonymousId,
    });
  }

  function handleMap(e: React.MouseEvent) {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="card-row" onClick={handleClick}>
      {/* Thumbnail */}
      <div
        className={`card-row__thumb ${thumbClass}`}
        style={hasImage ? { backgroundImage: `url(${restaurant.image_url})` } : undefined}
      />

      {/* Contenu */}
      <div className="card-row__content">
        <div className="card-row__top">
          <p className="card-row__name">{restaurant.name}</p>
        </div>

        <div className="card-row__meta">
          {restaurant.rating !== null && (
            <span className="card-row__rating">★ {restaurant.rating.toFixed(1)}</span>
          )}
          <span className="card-row__distance">{formatDistance(restaurant.distance_meters)}</span>
          {tag && (
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "var(--color-accent-soft)",
                color: "var(--color-accent-text)",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {tag}
            </span>
          )}
          {/* Slot badge */}
          <SlotBadge reason={restaurant.reason} position={globalPosition} />
        </div>
      </div>

      {/* Bouton Maps */}
      <div className="card-row__actions">
        <button
          onClick={handleMap}
          className="btn-map btn-map--arrow"
          aria-label={`Y aller — ${restaurant.name}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
