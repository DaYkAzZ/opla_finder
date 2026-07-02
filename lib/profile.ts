import { getSupabaseClient } from "./supabase";
import type { UserProfile, ProfileUpdate } from "@/types/profile";

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function createProfile(
  userId: string,
  displayName: string | null,
  avatarUrl: string | null,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      cuisines: [],
      venue_types: [],
      price_levels: [],
      max_distance: 1000,
      onboarding_done: false,
    } as Record<string, unknown>)
    .select()
    .single();

  if (error || !data) throw new Error("Impossible de créer le profil");
  return data as UserProfile;
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<UserProfile> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) throw new Error("Impossible de mettre à jour le profil");
  return data as UserProfile;
}
