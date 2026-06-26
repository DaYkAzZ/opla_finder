import posthog from 'posthog-js'

type EventProperties = Record<string, string | number | boolean | null | undefined>

export function trackEvent(event: string, properties?: EventProperties) {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  posthog.capture(event, properties)
}
