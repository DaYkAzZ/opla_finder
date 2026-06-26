import type { RecommendationReason } from "@/types/restaurant";

const LABELS: Record<RecommendationReason, string> = {
  closest: "Proche de vous",
  top_rated: "Très bien noté",
  well_referenced: "Bien référencé",
  weather_match: "Adapté à la météo",
  never_tried: "À découvrir",
};

interface Props {
  reason: RecommendationReason;
  small?: boolean;
}

export default function ReasonBadge({ reason, small = false }: Props) {
  return (
    <span className={`badge${small ? " badge--small" : ""}`}>
      {LABELS[reason]}
    </span>
  );
}
