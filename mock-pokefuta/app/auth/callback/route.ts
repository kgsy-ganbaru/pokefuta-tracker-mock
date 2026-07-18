import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/account";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/account";

  if (!code) return NextResponse.redirect(new URL("/account?authError=invalid-link", url.origin));

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return NextResponse.redirect(new URL("/account?authError=unavailable", url.origin));

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/account?authError=expired-link", url.origin));

  const { data: { user } } = await supabase.auth.getUser();
  if (user?.email) {
    const { data: profile } = await supabase.from("users").select("user_id").eq("id", user.id).maybeSingle();
    const admin = createAdminClient();
    if (profile?.user_id && admin) {
      await admin.from("login_identities").upsert({
        user_id: user.id,
        login_id: profile.user_id,
        email: user.email.toLowerCase(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}

