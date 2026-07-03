import { createClient } from '@supabase/supabase-js'

// Client côté serveur uniquement (Service Role Key)
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Variables Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY)'
    )
  }

  return createClient(url, key)
}

// Singleton côté navigateur (Anon Key + Auth)
let browserClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Variables Supabase manquantes côté client')
  }

  browserClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return browserClient
}
