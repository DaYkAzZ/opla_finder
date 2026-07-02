export type CuisineTag =
  | 'japanese'
  | 'italian'
  | 'french'
  | 'burger'
  | 'pizza'
  | 'chinese'
  | 'indian'
  | 'mexican'
  | 'thai'
  | 'mediterranean'
  | 'vietnamese'
  | 'sushi'
  | 'kebab'
  | 'vegan'
  | 'seafood'

export type VenueType =
  | 'restaurant'
  | 'bar'
  | 'bistro'
  | 'brasserie'
  | 'cafe'
  | 'fast_food'

export type PriceLevel = 1 | 2 | 3 | 4

export type MaxDistance = 200 | 500 | 1000 | 2000

export type UserProfile = {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  cuisines: CuisineTag[]
  venue_types: VenueType[]
  price_levels: PriceLevel[]
  max_distance: MaxDistance
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export type ProfileUpdate = Partial<
  Pick<
    UserProfile,
    'cuisines' | 'venue_types' | 'price_levels' | 'max_distance' | 'onboarding_done'
  >
>
