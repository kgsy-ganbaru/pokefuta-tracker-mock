import Link from "next/link";
import { requireAdmin } from "../lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { admin } = await requireAdmin();
  const [{ count: userCount }, { count: pokefutaCount }, { count: adminCount }] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin.from("pokefuta").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("users").select("id", { count: "exact", head: true }).eq("is_admin", true).eq("is_active", true),
  ]);

  const cards = [
    { href: "/admin/users", title: "利用者管理", description: "パスワードの初期化、利用停止、管理者権限を管理します。", count: `${userCount ?? 0}人` },
    { href: "/admin/pokefuta", title: "ポケふた管理", description: "ポケふたの新規登録、編集、公開状態を管理します。", count: `${pokefutaCount ?? 0}種類` },
    { href: "/admin/audit", title: "操作履歴", description: "管理者が行った重要な操作を確認します。", count: `管理者 ${adminCount ?? 0}人` },
  ];

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 pb-28 sm:p-6">
      <header>
        <p className="text-sm font-semibold text-emerald-700">管理者専用</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">管理</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">利用者とポケふたの情報を安全に管理します。</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold text-gray-900">{card.title}</h2>
              <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{card.count}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-600">{card.description}</p>
            <p className="mt-4 text-sm font-semibold text-emerald-700">開く</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
