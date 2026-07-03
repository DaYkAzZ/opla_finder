export type Restaurant = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  cuisine: string | null; // ex: "italian", "french;japanese"
  venue_type: string | null; // ex: "restaurant", "bar", "cafe"
  opening_hours: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
  osm_tags_count: number;
  distance_meters: number;
  reason: RecommendationReason;
  image_url?: string | null;
};

export type RecommendationReason =
  | "closest"
  | "top_rated"
  | "well_referenced"
  | "weather_match"
  | "never_tried";

export type ScoredRestaurant = Restaurant & {
  score: number;
};

export type ApiResponse = {
  todaysPick: Restaurant;
  topFive: Restaurant[];
  fetchedAt: string;
  fromCache: boolean;
};
