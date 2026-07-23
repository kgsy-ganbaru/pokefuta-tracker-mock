import { cache } from "react";
import { createAdminClient, createClient, SupabaseServerClient } from "./server";

export type AuthProfile = {
  id: string;
  user_id: string;
  nickname: string;
  comment: string | null;
  friend_code: string | null;
  is_admin: boolean;
  is_active: boolean;
  must_change_password: boolean;
};

function deriveUserIdFromEmail(email?: string | null) {
  if (!email) return "";
  return email.split("@")[0] ?? email;
}

export const getCachedAuthUser = cache(async () => {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function getAuthProfile(
  supabaseClient?: SupabaseServerClient | null
) {
  const supabase = supabaseClient ?? (await createClient());
  if (!supabase) {
    return null;
  }
  const user = supabaseClient
    ? (await supabase.auth.getUser()).data.user
    : await getCachedAuthUser();

  if (!user) return null;

  const admin = createAdminClient();
  const profileClient = admin ?? supabase;
  const { data: profile } = await profileClient
    .from("users")
    .select("id, user_id, nickname, comment, friend_code, is_admin, is_active, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  const fallbackUserId = deriveUserIdFromEmail(user.email);

  return {
    id: profile?.id ?? user.id,
    user_id: profile?.user_id ?? fallbackUserId,
    nickname:
      profile?.nickname ??
      (user.user_metadata?.nickname as string | undefined) ??
      fallbackUserId ??
      "",
    comment: profile?.comment ?? null,
    friend_code: profile?.friend_code ?? null,
    is_admin: profile?.is_admin === true,
    is_active: profile?.is_active !== false,
    must_change_password: profile?.must_change_password === true,
  } satisfies AuthProfile;
}

// A single navigation renders the shared layout and page together. Reuse the
// same authentication/profile lookup instead of requesting it once per segment.
export const getCachedAuthProfile = cache(() => getAuthProfile());

export function userIdToEmail(userId: string) {
  if (userId.includes("@")) {
    return userId;
  }
  return `${userId}@pokefuta.local`;
}
