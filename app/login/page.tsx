'use client'

import { useState } from 'react'
import { signInWithGoogle } from '@/lib/auth'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError('Connexion impossible. Réessaie.')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: 'var(--color-bg)',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 700,
            letterSpacing: '-2px',
            margin: '0 0 12px',
            color: 'var(--color-text)',
          }}
        >
          opla
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Où manger maintenant,
          <br />
          décidé en{' '}
          <span style={{ color: 'var(--color-accent-text)', fontWeight: 600 }}>
            10 secondes.
          </span>
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text)',
            textAlign: 'center',
          }}
        >
          Connexion
        </p>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '14px 20px',
            border: '1.5px solid rgba(26,26,26,0.10)',
            borderRadius: 'var(--radius-full)',
            background: loading ? 'var(--color-surface-muted)' : 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '2px solid var(--color-accent-soft)',
                borderTopColor: 'var(--color-accent)',
                display: 'inline-block',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Connexion…' : 'Continuer avec Google'}
        </button>

        {error && (
          <p style={{ margin: 0, fontSize: '13px', color: '#e53e3e', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Tes préférences seront sauvegardées pour
          personnaliser tes recommandations.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
