'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from '@/lib/profile'
import type { CuisineTag, VenueType, PriceLevel, MaxDistance } from '@/types/profile'

// ── Données des options ──────────────────────────────────────────

const CUISINES: { id: CuisineTag; label: string; emoji: string }[] = [
  { id: 'french', label: 'Français', emoji: '🥖' },
  { id: 'italian', label: 'Italien', emoji: '🍝' },
  { id: 'japanese', label: 'Japonais', emoji: '🍱' },
  { id: 'sushi', label: 'Sushi', emoji: '🍣' },
  { id: 'burger', label: 'Burger', emoji: '🍔' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'chinese', label: 'Chinois', emoji: '🥡' },
  { id: 'thai', label: 'Thaï', emoji: '🍜' },
  { id: 'indian', label: 'Indien', emoji: '🍛' },
  { id: 'mexican', label: 'Mexicain', emoji: '🌮' },
  { id: 'mediterranean', label: 'Méditerranéen', emoji: '🫒' },
  { id: 'vietnamese', label: 'Vietnamien', emoji: '🍲' },
  { id: 'kebab', label: 'Kebab', emoji: '🥙' },
  { id: 'vegan', label: 'Végétalien', emoji: '🥗' },
  { id: 'seafood', label: 'Fruits de mer', emoji: '🦞' },
]

const VENUE_TYPES: { id: VenueType; label: string; emoji: string }[] = [
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'bistro', label: 'Bistro', emoji: '🥂' },
  { id: 'brasserie', label: 'Brasserie', emoji: '🍺' },
  { id: 'bar', label: 'Bar', emoji: '🍸' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'fast_food', label: 'Fast-food', emoji: '🌯' },
]

const PRICE_LEVELS: { id: PriceLevel; label: string; desc: string }[] = [
  { id: 1, label: '€', desc: 'Moins de 15€' },
  { id: 2, label: '€€', desc: '15 – 30€' },
  { id: 3, label: '€€€', desc: '30 – 60€' },
  { id: 4, label: '€€€€', desc: 'Plus de 60€' },
]

const DISTANCES: { id: MaxDistance; label: string }[] = [
  { id: 200, label: '200 m' },
  { id: 500, label: '500 m' },
  { id: 1000, label: '1 km' },
  { id: 2000, label: '2 km' },
]

// ── Composant principal ──────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [cuisines, setCuisines] = useState<CuisineTag[]>([])
  const [venueTypes, setVenueTypes] = useState<VenueType[]>([])
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>([])
  const [maxDistance, setMaxDistance] = useState<MaxDistance>(1000)

  const STEPS = ['Cuisine', 'Type de lieu', 'Budget', 'Distance']
  const progress = ((step + 1) / STEPS.length) * 100

  function toggleCuisine(id: CuisineTag) {
    setCuisines((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function toggleVenue(id: VenueType) {
    setVenueTypes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    )
  }

  function togglePrice(id: PriceLevel) {
    setPriceLevels((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.id, {
        cuisines,
        venue_types: venueTypes,
        price_levels: priceLevels,
        max_distance: maxDistance,
        onboarding_done: true,
      })
      router.replace('/')
    } catch (err) {
      console.error('[onboarding] Erreur save:', err)
      setSaving(false)
    }
  }

  const canNext =
    step === 0
      ? true // cuisine : pas d'obligation
      : step === 1
      ? true // venue : pas d'obligation
      : step === 2
      ? true // prix : pas d'obligation
      : true  // distance : toujours une valeur

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
      }}
    >
      {/* Header avec progression */}
      <div
        style={{
          padding: '20px 24px 0',
          maxWidth: 'var(--max-width)',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Barre de progression */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '28px',
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                background: i <= step ? 'var(--color-accent)' : 'var(--color-surface-muted)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>

        <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-accent-text)' }}>
          {step + 1} / {STEPS.length}
        </p>
      </div>

      {/* Contenu de l'étape */}
      <div
        style={{
          flex: 1,
          padding: '0 24px 24px',
          maxWidth: 'var(--max-width)',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {step === 0 && (
          <StepCuisines selected={cuisines} onToggle={toggleCuisine} />
        )}
        {step === 1 && (
          <StepVenueTypes selected={venueTypes} onToggle={toggleVenue} />
        )}
        {step === 2 && (
          <StepPrice selected={priceLevels} onToggle={togglePrice} />
        )}
        {step === 3 && (
          <StepDistance selected={maxDistance} onSelect={setMaxDistance} />
        )}
      </div>

      {/* Footer navigation */}
      <div
        style={{
          padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
          maxWidth: 'var(--max-width)',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
        }}
      >
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              flex: '0 0 auto',
              padding: '14px 20px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retour
          </button>
        )}

        <button
          onClick={() => {
            if (step < STEPS.length - 1) {
              setStep((s) => s + 1)
            } else {
              handleFinish()
            }
          }}
          disabled={saving}
          style={{
            flex: 1,
            padding: '14px 20px',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent)',
            color: 'var(--color-text)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Enregistrement…' : step === STEPS.length - 1 ? 'Commencer' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}

// ── Étape 1 : Cuisines ───────────────────────────────────────────

function StepCuisines({
  selected,
  onToggle,
}: {
  selected: CuisineTag[]
  onToggle: (id: CuisineTag) => void
}) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
        Quelles cuisines tu aimes ?
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Sélectionne tout ce qui te tente. Tu pourras modifier ça plus tard.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {CUISINES.map((c) => {
          const active = selected.includes(c.id)
          return (
            <button
              key={c.id}
              onClick={() => onToggle(c.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                borderRadius: 'var(--radius-full)',
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                boxShadow: active ? 'none' : 'var(--shadow-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Étape 2 : Types de lieu ──────────────────────────────────────

function StepVenueTypes({
  selected,
  onToggle,
}: {
  selected: VenueType[]
  onToggle: (id: VenueType) => void
}) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
        Quel type d&apos;endroit ?
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Plusieurs choix possibles.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {VENUE_TYPES.map((v) => {
          const active = selected.includes(v.id)
          return (
            <button
              key={v.id}
              onClick={() => onToggle(v.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                fontSize: '15px',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: active ? 'none' : 'var(--shadow-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '22px' }}>{v.emoji}</span>
              <span>{v.label}</span>
              {active && (
                <span style={{ marginLeft: 'auto', color: 'var(--color-accent-text)' }}>✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Étape 3 : Prix ───────────────────────────────────────────────

function StepPrice({
  selected,
  onToggle,
}: {
  selected: PriceLevel[]
  onToggle: (id: PriceLevel) => void
}) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
        Quel budget ?
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Par personne, sans les boissons.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PRICE_LEVELS.map((p) => {
          const active = selected.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => onToggle(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: active ? 'none' : 'var(--shadow-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{p.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: active ? 'var(--color-accent-text)' : 'var(--color-text-muted)' }}>
                  {p.desc}
                </p>
              </div>
              {active && <span style={{ fontSize: '18px' }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Étape 4 : Distance ───────────────────────────────────────────

function StepDistance({
  selected,
  onSelect,
}: {
  selected: MaxDistance
  onSelect: (d: MaxDistance) => void
}) {
  return (
    <div>
      <h2 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--color-text)' }}>
        À quelle distance ?
      </h2>
      <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
        Distance max pour les restaurants proposés.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DISTANCES.map((d) => {
          const active = selected === d.id
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px',
                border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                borderRadius: 'var(--radius-lg)',
                background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                fontSize: '16px',
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: active ? 'none' : 'var(--shadow-soft)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{d.label}</span>
              {active && <span>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
