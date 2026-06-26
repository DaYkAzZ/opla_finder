"use client";

import type { Restaurant } from "@/types/restaurant";
import { trackEvent } from "@/lib/analytics";
import { RestaurantCard } from "./TopRatedCarousel";
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

  return (
    <RestaurantCard
      restaurant={restaurant}
      fullWidth
      onClick={handleClick}
      action={<MapButton restaurant={restaurant} arrow />}
    />
  );
}
