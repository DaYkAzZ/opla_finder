import type { RecommendationReason } from '@/types/restaurant'

const LABELS: Record<RecommendationReason, string> = {
  closest: 'Proche de vous',
  top_rated: 'Très bien noté',
  well_referenced: 'Bien référencé',
  weather_match: 'Adapté à la météo',
  never_tried: 'À découvrir',
}

interface Props {
  reason: RecommendationReason
  small?: boolean
}

export default function ReasonBadge({ reason, small = false }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: small ? 'rgba(138,211,132,0.15)' : 'rgba(138,211,132,0.18)',
        color: '#5BB856',
        borderRadius: '100px',
        padding: small ? '2px 8px' : '4px 12px',
        fontSize: small ? '11px' : '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {LABELS[reason]}
    </span>
  )
}
