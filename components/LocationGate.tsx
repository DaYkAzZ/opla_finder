'use client'

interface Props {
  status: 'waiting' | 'denied'
}

export default function LocationGate({ status }: Props) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '40px' }}>{status === 'waiting' ? '📍' : '🚫'}</div>
      <p style={{ fontSize: '17px', color: '#1A1A1A', fontWeight: 500, margin: 0 }}>
        {status === 'waiting'
          ? 'Localisation en cours…'
          : 'Localisation refusée'}
      </p>
      {status === 'denied' && (
        <p style={{ fontSize: '14px', color: '#ABABAB', margin: 0, maxWidth: '260px' }}>
          Active la localisation dans les réglages de ton navigateur pour continuer.
        </p>
      )}
    </div>
  )
}
