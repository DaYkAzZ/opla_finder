'use client'

import type { Restaurant } from '@/types/restaurant'
import { trackEvent } from '@/lib/analytics'
import ReasonBadge from './ReasonBadge'
import MapButton from './MapButton'

interface Props {
  restaurants: Restaurant[]
  anonymousId: string
}

export default function TopFive({ restaurants, anonymousId }: Props) {
  if (restaurants.length === 0) {
    return (
      <p style={{ fontSize: '14px', color: '#ABABAB' }}>
        Pas d&apos;autres restaurants à proximité.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {restaurants.map((restaurant, index) => (
        <RestaurantRow
          key={restaurant.id}
          restaurant={restaurant}
          position={index + 1}
          anonymousId={anonymousId}
        />
      ))}
    </div>
  )
}

function RestaurantRow({
  restaurant,
  position,
  anonymousId,
}: {
  restaurant: Restaurant
  position: number
  anonymousId: string
}) {
  function handleClick() {
    trackEvent('top5_clicked', {
      restaurant_id: restaurant.id,
      position,
      reason: restaurant.reason,
      anonymous_id: anonymousId,
    })
  }

  const distanceLabel =
    restaurant.distance_meters < 1000
      ? `${Math.round(restaurant.distance_meters)} m`
      : `${(restaurant.distance_meters / 1000).toFixed(1)} km`

  return (
    <div
      onClick={handleClick}
      style={{
        backgroundColor: '#F7F6F7',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {/* Rang */}
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#ABABAB',
            minWidth: '18px',
          }}
        >
          {position}
        </span>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 600,
              color: '#1A1A1A',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {restaurant.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '12px', color: '#ABABAB' }}>{distanceLabel}</span>
            {restaurant.rating !== null && (
              <span style={{ fontSize: '12px', color: '#8AD384', fontWeight: 600 }}>
                ★ {restaurant.rating.toFixed(1)}
              </span>
            )}
            <ReasonBadge reason={restaurant.reason} small />
          </div>
        </div>
      </div>

      <MapButton restaurant={restaurant} small />
    </div>
  )
}
