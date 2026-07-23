import PageBackLink from "../../components/PageBackLink";
import { requireAdmin } from "../../lib/admin";
import { resetUserPasswordAction, toggleUserActiveAction, toggleUserAdminAction } from "../../actions/admin";
import AdminSubmitButton from "../AdminSubmitButton";

type ProfileRow = { id: string; user_id: string; nickname: string; is_admin: boolean; is_active: boolean; must_change_password: boolean; created_at: string };

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const { message, error } = await searchParams;
  const { admin, user } = await requireAdmin();
  const { data } = await admin.from("users").select("id, user_id, nickname, is_admin, is_active, must_change_password, created_at").order("created_at", { ascending: true });
  const rows = (data ?? []) as ProfileRow[];

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 pb-28 sm:p-6">
      <PageBackLink href="/admin" label="管理に戻る" />
      <header><h1 className="text-2xl font-bold text-gray-900">利用者管理</h1><p className="mt-2 text-sm text-gray-600">仮パスワードは本人へ安全な方法で伝えてください。</p></header>
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      <div className="space-y-4">
        {rows.map((row) => (
          <section key={row.id} className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><h2 className="font-bold text-gray-900">{row.nickname}</h2><p className="text-sm text-gray-500">ID: {row.user_id}</p></div>
              <div className="flex gap-2">
                {row.is_admin && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">管理者</span>}
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.is_active ? "bg-blue-50 text-blue-700" : "bg-gray-200 text-gray-600"}`}>{row.is_active ? "利用中" : "停止中"}</span>
              </div>
            </div>
            {row.must_change_password && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">仮パスワード設定済み・本人の変更待ち</p>}
            <div className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
              <form action={resetUserPasswordAction} className="flex gap-2">
                <input type="hidden" name="targetUserId" value={row.id} />
                <input name="password" type="password" minLength={8} required placeholder="仮パスワード（8文字以上）" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" />
                <AdminSubmitButton className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white" confirmMessage={`${row.nickname}さんのパスワードを初期化しますか？`}>設定</AdminSubmitButton>
              </form>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <form action={toggleUserAdminAction}>
                  <input type="hidden" name="targetUserId" value={row.id} /><input type="hidden" name="nextAdmin" value={String(!row.is_admin)} />
                  <AdminSubmitButton className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50" confirmMessage={`${row.nickname}さんの管理者権限を${row.is_admin ? "解除" : "追加"}しますか？`}>{row.is_admin ? "管理者を解除" : "管理者にする"}</AdminSubmitButton>
                </form>
                <form action={toggleUserActiveAction}>
                  <input type="hidden" name="targetUserId" value={row.id} /><input type="hidden" name="nextActive" value={String(!row.is_active)} />
                  <AdminSubmitButton className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50" confirmMessage={`${row.nickname}さんのアカウントを${row.is_active ? "停止" : "再開"}しますか？`}>{row.is_active ? "利用停止" : "利用再開"}</AdminSubmitButton>
                </form>
              </div>
            </div>
            {row.id === user.id && <p className="mt-3 text-right text-xs text-gray-400">現在のアカウント</p>}
          </section>
        ))}
      </div>
    </main>
  );
}
