import { loginAction, logoutAction } from "../actions/auth";
import { getAuthProfile } from "../lib/supabase/auth";
import LoginForm from "./LoginForm";

export default async function AccountPage() {
  const user = await getAuthProfile();

  if (user) {
    return (
      <main className="max-w-md mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">アカウント</h2>

        <p className="mb-1">ニックネーム：{user.nickname}</p>
        <p className="text-sm text-gray-500">ユーザーID：{user.user_id}</p>

        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-6 w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            ログアウト
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">ゲスト</h2>

      <LoginForm action={loginAction} />

      <button
        type="button"
        onClick={() => alert("新規登録は次に実装")}
        className="w-full mt-2 py-2 rounded border hover:bg-gray-50"
      >
        新規登録
      </button>
    </main>
  );
}