import Link from "next/link";
import PageBackLink from "../../components/PageBackLink";
import { requireAdmin } from "../../lib/admin";
import { togglePokefutaActiveAction } from "../../actions/admin";
import { formatPokemonNames } from "../../lib/pokefuta/listData";
import AdminSubmitButton from "../AdminSubmitButton";

type Row = { id: number; city_name: string; image_url: string | null; is_active: boolean; prefecture_id: number | null; pokefuta_pokemon: { pokemon_name: string; display_order: number | null }[] | null };

export const dynamic = "force-dynamic";

export default async function AdminPokefutaPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string; q?: string }> }) {
  const { message, error, q = "" } = await searchParams;
  const { admin } = await requireAdmin();
  let query = admin.from("pokefuta").select("id, city_name, image_url, is_active, prefecture_id, pokefuta_pokemon (pokemon_name, display_order)").order("id", { ascending: false }).limit(100);
  if (q.trim()) query = query.ilike("city_name", `%${q.trim()}%`);
  const { data } = await query;
  const rows = (data ?? []) as Row[];

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 pb-28 sm:p-6">
      <PageBackLink href="/admin" label="管理に戻る" />
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">ポケふた管理</h1><p className="mt-1 text-sm text-gray-600">削除せず、不要なものは非公開にします。</p></div><Link href="/admin/pokefuta/new" className="pft-primary-button shrink-0 rounded-full px-4 py-3 text-sm font-bold">新規登録</Link></div>
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="市区町村で検索" className="min-w-0 flex-1 rounded-xl border px-3 py-3" /><button className="rounded-xl border bg-white px-4 font-semibold">検索</button></form>
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{message}</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm ${row.is_active ? "" : "opacity-60"}`}>
            <img src={row.image_url || "/no-image.png"} alt="" className="h-16 w-16 shrink-0 rounded-full border object-cover" />
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-bold text-gray-900">{row.city_name}</h2>{!row.is_active && <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-bold">非公開</span>}</div><p className="truncate text-xs text-gray-500">{formatPokemonNames(row.pokefuta_pokemon)}</p><p className="mt-1 text-[11px] text-gray-400">ID: {row.id}</p></div>
            <div className="flex shrink-0 flex-col gap-2"><Link href={`/admin/pokefuta/${row.id}/edit`} className="rounded-lg border border-emerald-300 px-3 py-2 text-center text-xs font-bold text-emerald-700">編集</Link><form action={togglePokefutaActiveAction}><input type="hidden" name="pokefutaId" value={row.id} /><input type="hidden" name="nextActive" value={String(!row.is_active)} /><AdminSubmitButton className="w-full rounded-lg border px-3 py-2 text-xs font-bold text-gray-700" confirmMessage={`${row.city_name}を${row.is_active ? "非公開" : "公開"}にしますか？`}>{row.is_active ? "非公開" : "公開"}</AdminSubmitButton></form></div>
          </article>
        ))}
      </div>
    </main>
  );
}
