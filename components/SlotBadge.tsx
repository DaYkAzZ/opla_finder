import type { RecommendationReason } from "@/types/restaurant";

interface Props {
  reason: RecommendationReason;
  position?: number; // 0 = todaysPick, 1-3 = match, 4 = top_rated, 5 = discovery
}

const CONFIG: Record<
  RecommendationReason,
  { label: string; variant: "match" | "top" | "discovery" }
> = {
  closest:        { label: "✦ Pour toi",    variant: "match" },
  well_referenced:{ label: "✦ Pour toi",    variant: "match" },
  weather_match:  { label: "✦ Pour toi",    variant: "match" },
  top_rated:      { label: "⭐ Top noté",   variant: "top" },
  never_tried:    { label: "✦ Découverte",  variant: "discovery" },
};

const POSITION_LABELS: Record<number, string> = {
  0: "🏆 Top 1",
  1: "✦ Top 2",
  2: "✦ Top 3",
  3: "✦ Top 4",
};

export default function SlotBadge({ reason, position }: Props) {
  const { variant } = CONFIG[reason];

  // Pour les slots match (0-3), on affiche la position
  let label: string;
  if (variant === "match" && position !== undefined && position in POSITION_LABELS) {
    label = POSITION_LABELS[position];
  } else {
    label = CONFIG[reason].label;
  }

  return (
    <span className={`slot-badge slot-badge--${variant}`}>
      {label}
    </span>
  );
}
