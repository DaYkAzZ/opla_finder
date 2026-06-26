"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from "@/lib/analytics";
import { formatDistance } from "@/lib/restaurants";
import ReasonBadge from "./ReasonBadge";
import MapButton from "./MapButton";

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
            <ReasonBadge reason={restaurant.reason} small />
          </div>
        </div>
      </div>

      <MapButton restaurant={restaurant} small arrow />
    </div>
  );
}
