"use client";

import type { Restaurant, RecommendationReason } from "@/types/restaurant";
import { formatDistance } from "@/lib/restaurants";

const REASON_LABELS: Record<RecommendationReason, string> = {
  closest: "Proche",
  top_rated: "Top noté",
  well_referenced: "Populaire",
  weather_match: "Adapté",
  never_tried: "Nouveau",
};

const REASON_COPY: Record<Restaurant["reason"], string> = {
  closest: "Le plus proche de toi, idéal pour manger vite.",
  top_rated: "Très bien noté par la communauté.",
  well_referenced: "Un établissement bien référencé dans le quartier.",
  weather_match: "Adapté aux conditions du moment.",
  never_tried: "Une adresse à découvrir près de chez toi.",
};

const MEDIA_CLASSES = [
  "restaurant-card__media--1",
  "restaurant-card__media--2",
  "restaurant-card__media--3",
  "restaurant-card__media--4",
] as const;

function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}

function mediaClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % MEDIA_CLASSES.length;
  }
  return MEDIA_CLASSES[hash];
}

function formatTags(restaurant: Restaurant): string {
  const parts: string[] = [];
  if (restaurant.cuisine) parts.push(restaurant.cuisine.replace(/_/g, " "));
  parts.push(formatDistance(restaurant.distance_meters));
  return parts.join(" · ");
}

interface CardProps {
  restaurant: Restaurant;
  fullWidth?: boolean;
  onClick?: () => void;
  action?: React.ReactNode;
}

export function RestaurantCard({
  restaurant,
  fullWidth = false,
  onClick,
  action,
}: CardProps) {
  const walkLabel = `${walkMinutes(restaurant.distance_meters)} min`;

  return (
    <article
      className={`restaurant-card${fullWidth ? " restaurant-card--full" : ""}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className={`restaurant-card__media ${mediaClass(restaurant.id)}`}>
        {restaurant.rating !== null ? (
          <span className="badge badge--on-image">
            ★ {restaurant.rating.toFixed(1)}
          </span>
        ) : (
          <span className="badge badge--on-image">
            {REASON_LABELS[restaurant.reason]}
          </span>
        )}
      </div>

      <div className="restaurant-card__panel">
        <div className="restaurant-card__head">
          <span className="restaurant-card__icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C12 2 6 8 6 13C6 16.3 8.7 19 12 19C15.3 19 18 16.3 18 13C18 8 12 2 12 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div style={{ minWidth: 0 }}>
            <h3 className="restaurant-card__name">{restaurant.name}</h3>
            <p className="restaurant-card__tags">{formatTags(restaurant)}</p>
          </div>
        </div>

        <p className="restaurant-card__reason">
          {REASON_COPY[restaurant.reason]}
        </p>

        <div className="restaurant-card__stats">
          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">{walkLabel}</span>
            <span className="restaurant-card__stat-label">À pied</span>
          </div>

          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.5 8.5L21 9.3L16.25 13.7L17.2 20L12 17L6.8 20L7.75 13.7L3 9.3L9.5 8.5L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">
              {restaurant.rating !== null
                ? restaurant.rating.toFixed(1)
                : "—"}
            </span>
            <span className="restaurant-card__stat-label">
              {restaurant.rating_count !== null
                ? `(${restaurant.rating_count})`
                : "Note"}
            </span>
          </div>

          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C12 2 6 8 6 13C6 16.3 8.7 19 12 19C15.3 19 18 16.3 18 13C18 8 12 2 12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">
              {formatDistance(restaurant.distance_meters)}
            </span>
            <span className="restaurant-card__stat-label">Distance</span>
          </div>

          {action}
        </div>
      </div>
    </article>
  );
}

interface Props {
  restaurants: Restaurant[];
}

export default function TopRatedCarousel({ restaurants }: Props) {
  if (restaurants.length === 0) {
    return <p className="empty-text">Aucun restaurant trouvé à proximité.</p>;
  }

  return (
    <div className="carousel">
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
}
