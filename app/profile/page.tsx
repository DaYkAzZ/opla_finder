'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { updateProfile } from '@/lib/profile'
import { signOut } from '@/lib/auth'
import type { CuisineTag, VenueType, PriceLevel, MaxDistance } from '@/types/profile'

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

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, setProfile, loading } = useProfile(user)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [cuisines, setCuisines] = useState<CuisineTag[] | null>(null)
  const [venueTypes, setVenueTypes] = useState<VenueType[] | null>(null)
  const [priceLevels, setPriceLevels] = useState<PriceLevel[] | null>(null)
  const [maxDistance, setMaxDistance] = useState<MaxDistance | null>(null)

  // Initialise les états locaux depuis le profil dès qu'il est chargé
  const currentCuisines = cuisines ?? profile?.cuisines ?? []
  const currentVenues = venueTypes ?? profile?.venue_types ?? []
  const currentPrices = priceLevels ?? profile?.price_levels ?? []
  const currentDistance = maxDistance ?? profile?.max_distance ?? 1000

  function toggle<T>(
    list: T[],
    setList: (v: T[]) => void,
    id: T
  ) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, {
        cuisines: currentCuisines,
        venue_types: currentVenues,
        price_levels: currentPrices,
        max_distance: currentDistance,
      })
      setProfile(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('[profile] Erreur save:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="loader__spinner" />
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="page-header__title">Mon profil</h1>
          {profile?.display_name && (
            <p className="page-header__subtitle">{profile.display_name}</p>
          )}
        </div>
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Section Cuisines */}
      <Section title="Mes cuisines préférées">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CUISINES.map((c) => {
            const active = currentCuisines.includes(c.id)
            return (
              <TagChip
                key={c.id}
                active={active}
                onClick={() =>
                  toggle(currentCuisines, (v) => setCuisines(v as CuisineTag[]), c.id)
                }
              >
                {c.emoji} {c.label}
              </TagChip>
            )
          })}
        </div>
      </Section>

      {/* Section Types de lieu */}
      <Section title="Types de lieu">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {VENUE_TYPES.map((v) => {
            const active = currentVenues.includes(v.id)
            return (
              <TagChip
                key={v.id}
                active={active}
                onClick={() =>
                  toggle(currentVenues, (val) => setVenueTypes(val as VenueType[]), v.id)
                }
              >
                {v.emoji} {v.label}
              </TagChip>
            )
          })}
        </div>
      </Section>

      {/* Section Budget */}
      <Section title="Mon budget">
        <div style={{ display: 'flex', gap: '8px' }}>
          {PRICE_LEVELS.map((p) => {
            const active = currentPrices.includes(p.id)
            return (
              <button
                key={p.id}
                onClick={() =>
                  toggle(currentPrices, (v) => setPriceLevels(v as PriceLevel[]), p.id)
                }
                style={{
                  flex: 1,
                  padding: '12px 4px',
                  border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                  color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: active ? 'none' : 'var(--shadow-soft)',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Section Distance */}
      <Section title="Distance maximale">
        <div style={{ display: 'flex', gap: '8px' }}>
          {DISTANCES.map((d) => {
            const active = currentDistance === d.id
            return (
              <button
                key={d.id}
                onClick={() => setMaxDistance(d.id)}
                style={{
                  flex: 1,
                  padding: '12px 4px',
                  border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
                  color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: active ? 'none' : 'var(--shadow-soft)',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '8px', opacity: saving ? 0.7 : 1 }}
      >
        {saving ? 'Enregistrement…' : saved ? '✓ Enregistré !' : 'Sauvegarder'}
      </button>

      {/* Déconnexion */}
      <button
        onClick={handleSignOut}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          border: '1.5px solid rgba(26,26,26,0.10)',
          borderRadius: 'var(--radius-full)',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Se déconnecter
      </button>
    </div>
  )
}

// ── Sous-composants ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <p className="section-label" style={{ marginBottom: '12px' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function TagChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        border: active ? '2px solid var(--color-accent)' : '2px solid transparent',
        borderRadius: 'var(--radius-full)',
        background: active ? 'var(--color-accent-soft)' : 'var(--color-surface)',
        color: active ? 'var(--color-accent-text)' : 'var(--color-text)',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        boxShadow: active ? 'none' : 'var(--shadow-soft)',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}
