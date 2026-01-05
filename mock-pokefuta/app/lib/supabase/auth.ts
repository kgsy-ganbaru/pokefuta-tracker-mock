import { createClient, SupabaseServerClient } from "./server";

export type AuthProfile = {
  id: string;
  user_id: string;
  nickname: string;
  comment: string | null;
};

function deriveUserIdFromEmail(email?: string | null) {
  if (!email) return "";
  return email.split("@")[0] ?? email;
}

export async function getAuthProfile(
  supabaseClient?: SupabaseServerClient | null
) {
  const supabase = supabaseClient ?? (await createClient());
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, user_id, nickname, comment")
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
  } satisfies AuthProfile;
}

export function userIdToEmail(userId: string) {
  if (userId.includes("@")) {
    return userId;
  }
  return `${userId}@pokefuta.local`;
}
