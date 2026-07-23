import PageBackLink from "../../components/PageBackLink";
import { requireAdmin } from "../../lib/admin";

type LogRow = { id: number; admin_user_id: string; action: string; target_type: string; target_id: string | null; details: Record<string, unknown>; created_at: string };
type UserRow = { id: string; nickname: string; user_id: string };

const actionLabels: Record<string, string> = {
  password_reset: "仮パスワードを設定",
  user_reactivated: "利用者を再開",
  user_suspended: "利用者を停止",
  admin_granted: "管理者権限を追加",
  admin_revoked: "管理者権限を解除",
  pokefuta_created: "ポケふたを登録",
  pokefuta_updated: "ポケふたを編集",
  pokefuta_published: "ポケふたを公開",
  pokefuta_hidden: "ポケふたを非公開",
};

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const { admin } = await requireAdmin();
  const [{ data: logData }, { data: userData }] = await Promise.all([
    admin.from("admin_audit_logs").select("id, admin_user_id, action, target_type, target_id, details, created_at").order("created_at", { ascending: false }).limit(100),
    admin.from("users").select("id, nickname, user_id"),
  ]);
  const users = new Map(((userData ?? []) as UserRow[]).map((row) => [row.id, row.nickname || row.user_id]));
  const logs = (logData ?? []) as LogRow[];
  return <main className="mx-auto max-w-3xl space-y-5 p-4 pb-28 sm:p-6"><PageBackLink href="/admin" label="管理に戻る" /><header><h1 className="text-2xl font-bold text-gray-900">操作履歴</h1><p className="mt-2 text-sm text-gray-600">パスワードそのものは記録されません。</p></header><div className="overflow-hidden rounded-2xl border bg-white shadow-sm">{logs.length === 0 ? <p className="p-6 text-center text-sm text-gray-500">操作履歴はありません。</p> : logs.map((log) => <article key={log.id} className="border-b p-4 last:border-b-0"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-gray-900">{actionLabels[log.action] ?? log.action}</p><time className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString("ja-JP")}</time></div><p className="mt-1 text-sm text-gray-600">操作: {users.get(log.admin_user_id) ?? log.admin_user_id}</p><p className="mt-1 text-xs text-gray-400">対象: {log.target_type} {log.target_id ?? ""}</p></article>)}</div></main>;
}
