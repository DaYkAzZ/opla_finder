"use client";

import type { Restaurant, RecommendationReason } from "@/types/restaurant";
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

const FALLBACK_CLASSES = [
  "restaurant-card__media--1",
  "restaurant-card__media--2",
  "restaurant-card__media--3",
  "restaurant-card__media--4",
] as const;

function fallbackClass(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 4;
  return FALLBACK_CLASSES[hash];
}

function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 80));
}

function buildTags(restaurant: Restaurant): string[] {
  const tags: string[] = [];
  if (restaurant.venue_type && VENUE_LABELS[restaurant.venue_type]) {
    tags.push(VENUE_LABELS[restaurant.venue_type]);
  }
  if (restaurant.cuisine) {
    restaurant.cuisine
      .split(";")
      .map((c) => c.trim())
      .slice(0, 1)
      .forEach((c) => {
        const label = CUISINE_LABELS[c] ?? c.replace(/_/g, " ");
        if (label) tags.push(label);
      });
  }
  return tags;
}

interface CardProps {
  restaurant: Restaurant;
  position: number; // index global dans la sélection (0 = pick, 1-5 = topFive)
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, position, onClick }: CardProps) {
  const tags = buildTags(restaurant);
  const hasImage = !!restaurant.image_url;

  const mediaClass = hasImage
    ? "restaurant-card__media--has-image"
    : fallbackClass(restaurant.id);

  return (
    <article
      className="restaurant-card"
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {/* Image / fallback gradient */}
      <div
        className={`restaurant-card__media ${mediaClass}`}
        style={hasImage ? { backgroundImage: `url(${restaurant.image_url})` } : undefined}
      >
        {/* Badge note en overlay */}
        {restaurant.rating !== null && (
          <span className="badge badge--on-image">
            ★ {restaurant.rating.toFixed(1)}
            {restaurant.rating_count ? ` (${restaurant.rating_count})` : ""}
          </span>
        )}
      </div>

      {/* Panel info */}
      <div className="restaurant-card__panel">
        <div className="restaurant-card__head">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="restaurant-card__name">{restaurant.name}</h3>

            {/* Tags cuisine + type */}
            {tags.length > 0 && (
              <div className="restaurant-card__tags">
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "var(--color-accent-soft)",
                      color: "var(--color-accent-text)",
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Slot badge positionnel */}
          <SlotBadge reason={restaurant.reason} position={position} />
        </div>

        {/* Stats */}
        <div className="restaurant-card__stats">
          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">{walkMinutes(restaurant.distance_meters)} min</span>
            <span className="restaurant-card__stat-label">À pied</span>
          </div>

          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 8.5L21 9.3L16.25 13.7L17.2 20L12 17L6.8 20L7.75 13.7L3 9.3L9.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">
              {restaurant.rating !== null ? restaurant.rating.toFixed(1) : "—"}
            </span>
            <span className="restaurant-card__stat-label">Note</span>
          </div>

          <div className="restaurant-card__stat">
            <span className="restaurant-card__stat-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="currentColor" />
              </svg>
            </span>
            <span className="restaurant-card__stat-value">{formatDistance(restaurant.distance_meters)}</span>
            <span className="restaurant-card__stat-label">Distance</span>
          </div>

          {/* Bouton Maps */}
          <button
            className="restaurant-card__map-btn"
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}&travelmode=walking`,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            aria-label={`Y aller — ${restaurant.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

interface Props {
  restaurants: Restaurant[];
  startPosition?: number; // offset pour les numéros de slot
}

export default function TopRatedCarousel({ restaurants, startPosition = 0 }: Props) {
  if (restaurants.length === 0) {
    return <p className="empty-text">Aucun restaurant trouvé à proximité.</p>;
  }

  return (
    <div className="carousel">
      {restaurants.map((r, i) => (
        <RestaurantCard key={r.id} restaurant={r} position={startPosition + i} />
      ))}
    </div>
  );
}
