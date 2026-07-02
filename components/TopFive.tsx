"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from "@/lib/analytics";
import { formatDistance } from "@/lib/restaurants";
import ReasonBadge from "./ReasonBadge";
import MapButton from "./MapButton";

const VENUE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  bar: "Bar",
  cafe: "Café",
  fast_food: "Fast-food",
  bistro: "Bistro",
  brasserie: "Brasserie",
};

const CUISINE_LABELS: Record<string, string> = {
  french: "Français",
  italian: "Italien",
  japanese: "Japonais",
  sushi: "Sushi",
  burger: "Burger",
  pizza: "Pizza",
  chinese: "Chinois",
  thai: "Thaï",
  indian: "Indien",
  mexican: "Mexicain",
  mediterranean: "Méditerranéen",
  vietnamese: "Vietnamien",
  kebab: "Kebab",
  vegan: "Végétalien",
  seafood: "Fruits de mer",
};

function buildTags(restaurant: Restaurant): string[] {
  const tags: string[] = [];
  if (restaurant.venue_type && VENUE_LABELS[restaurant.venue_type]) {
    tags.push(VENUE_LABELS[restaurant.venue_type]);
  }
  if (restaurant.cuisine) {
    const cuisines = restaurant.cuisine
      .split(";")
      .map((c) => c.trim())
      .slice(0, 1)
      .map((c) => CUISINE_LABELS[c] ?? c.replace(/_/g, " "))
      .filter(Boolean);
    tags.push(...cuisines);
  }
  return tags;
}

interface Props {
  restaurants: Restaurant[];
  anonymousId: string;
}

export default function TopFive({ restaurants, anonymousId }: Props) {
  if (restaurants.length === 0) {
    return (
      <p className="empty-text">Pas d&apos;autres restaurants à proximité.</p>
    );
  }

  return (
    <div className="card-list">
      {restaurants.map((restaurant, index) => (
        <RestaurantRow
          key={restaurant.id}
          restaurant={restaurant}
          position={index + 1}
          anonymousId={anonymousId}
        />
      ))}
    </div>
  );
}

function RestaurantRow({
  restaurant,
  position,
  anonymousId,
}: {
  restaurant: Restaurant;
  position: number;
  anonymousId: string;
}) {
  const tags = buildTags(restaurant);

  function handleClick() {
    trackEvent("top5_clicked", {
      restaurant_id: restaurant.id,
      position,
      reason: restaurant.reason,
      anonymous_id: anonymousId,
    });
  }

  return (
    <div className="card-row" onClick={handleClick}>
      <div className="card-row__content">
        <span className="card-row__rank">{position}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="card-row__name">{restaurant.name}</p>

          <div className="card-row__meta">
            <span className="card-row__distance">
              {formatDistance(restaurant.distance_meters)}
            </span>
            {restaurant.rating !== null && (
              <span className="card-row__rating">
                ★ {restaurant.rating.toFixed(1)}
              </span>
            )}
            {/* Tags cuisine + type */}
            {tags.map((t) => (
              <span
                key={t}
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
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <MapButton restaurant={restaurant} small arrow />
    </div>
  );
}
