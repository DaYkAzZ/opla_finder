import type { RecommendationReason } from "@/types/restaurant";

const CONFIG: Record<
  RecommendationReason,
  { label: string; bg: string; color: string }
> = {
  closest: {
    label: "Proche",
    bg: "var(--color-accent-soft)",
    color: "var(--color-accent-text)",
  },
  well_referenced: {
    label: "Populaire",
    bg: "var(--color-accent-soft)",
    color: "var(--color-accent-text)",
  },
  weather_match: {
    label: "Adapté",
    bg: "var(--color-accent-soft)",
    color: "var(--color-accent-text)",
  },
  // Slot spécial : top noté hors prefs — couleur dorée
  top_rated: {
    label: "⭐ Top noté",
    bg: "rgba(251, 191, 36, 0.15)",
    color: "#92680a",
  },
  // Slot spécial : découverte — couleur violette
  never_tried: {
    label: "✦ Découverte",
    bg: "rgba(139, 92, 246, 0.12)",
    color: "#6d28d9",
  },
};

interface Props {
  reason: RecommendationReason;
  small?: boolean;
}

export default function ReasonBadge({ reason, small = false }: Props) {
  const { label, bg, color } = CONFIG[reason];

  return (
    <span
      className={small ? "badge badge--small" : "badge"}
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
