import { loginAction, logoutAction } from "../actions/auth";
import { getAuthProfile } from "../lib/supabase/auth";
import Link from "next/link";
import LoginForm from "./LoginForm";
import LogoutForm from "./LogoutForm";

export default async function AccountPage() {
  const user = await getAuthProfile();

  if (user) {
    return (
      <main className="max-w-md mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">アカウント</h2>

        <p className="mb-1">ニックネーム：{user.nickname}</p>
        <p className="text-sm text-gray-500">ユーザーID：{user.user_id}</p>

        <LogoutForm action={logoutAction} />
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ゲスト</h2>

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
