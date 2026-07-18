import { loginAction, logoutAction } from "../actions/auth";
import { getAuthProfile } from "../lib/supabase/auth";
import Link from "next/link";
import LoginForm from "./LoginForm";
import LogoutForm from "./LogoutForm";
import AccountProfileEditor from "./AccountProfileEditor";
import NotificationList from "./NotificationList";
import { getNotifications, markNotificationsAsRead } from "../lib/notifications";
import { createClient } from "../lib/supabase/server";
import EmailSettings from "./EmailSettings";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ authError?: string }> }) {
  const { authError } = await searchParams;
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);

  if (user) {
    const { data: { user: authUser } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const authEmail = authUser?.email ?? null;
    const isLegacyPlaceholder = Boolean(authEmail?.endsWith("@pokefuta.local"));
    const notifications = supabase ? await getNotifications(supabase, user.id) : [];
    if (supabase) await markNotificationsAsRead(supabase, user.id);

    return (
      <main className="mx-auto max-w-md space-y-6 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <img
            src="/status-any-owned-pokeball.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
          <span>アカウント</span>
          <img
            src="/status-any-owned-pokeball.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5"
          />
        </h2>

        <NotificationList notifications={notifications} />

        <EmailSettings
          currentEmail={isLegacyPlaceholder ? null : authEmail}
          verified={Boolean(!isLegacyPlaceholder && authUser?.email_confirmed_at)}
        />

        <AccountProfileEditor key={`${user.nickname}:${user.comment}:${user.friend_code}`} user={user} />

        <LogoutForm action={logoutAction} />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ゲスト</h2>

      {authError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {authError === "expired-link" ? "認証リンクが無効または期限切れです。もう一度手続きしてください。" : "認証を完了できませんでした。もう一度お試しください。"}
        </p>
      )}

      <LoginForm action={loginAction} />

      <Link
        href="/account/register"
        className="block w-full mt-2 py-2 rounded border text-center hover:bg-gray-50"
      >
        新規登録
      </Link>
    </main>
  );
}
