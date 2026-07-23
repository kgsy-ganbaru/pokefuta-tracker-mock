import BoardPostFormClient from "./BoardPostFormClient";
import Link from "next/link";
import { fetchPokefutaRows, PokefutaRow } from "../../lib/pokefuta/listData";
import { getAuthProfile } from "../../lib/supabase/auth";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

const demoRows: PokefutaRow[] = [
  { id: 1, region_id: 1, prefecture_id: 1, prefecture_order: 1, city_name: "札幌", difficulty_code: "B", image_url: null, pokemon_names: "アローラロコン", owned_count: 8, any_owned_count: 12 },
  { id: 2, region_id: 1, prefecture_id: 1, prefecture_order: 2, city_name: "小樽", difficulty_code: "B", image_url: null, pokemon_names: "ロコン", owned_count: 4, any_owned_count: 9 },
  { id: 3, region_id: 2, prefecture_id: 4, prefecture_order: 1, city_name: "仙台", difficulty_code: "A", image_url: null, pokemon_names: "ラプラス", owned_count: 2, any_owned_count: 7 },
  { id: 4, region_id: 3, prefecture_id: 14, prefecture_order: 1, city_name: "横浜", difficulty_code: "B", image_url: null, pokemon_names: "ピカチュウ", owned_count: 6, any_owned_count: 15 },
  { id: 5, region_id: 4, prefecture_id: 17, prefecture_order: 1, city_name: "金沢", difficulty_code: "A", image_url: null, pokemon_names: "ミロカロス", owned_count: 1, any_owned_count: 5 },
  { id: 6, region_id: 7, prefecture_id: 43, prefecture_order: 1, city_name: "熊本", difficulty_code: "A", image_url: null, pokemon_names: "ダダリン", owned_count: 3, any_owned_count: 8 },
];

export default async function NewBoardThreadPage() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);
  if (supabase && !user) {
    return <main className="mx-auto max-w-xl p-6 text-center"><h1 className="text-xl font-semibold text-gray-800">投稿するにはログインが必要です</h1><p className="mt-3 text-sm text-gray-500">ログイン後、持っているポケふたから交換に出すものを選べます。</p><Link href="/account" className="mt-6 inline-block rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white">ログインへ</Link></main>;
  }
  const rows = supabase
    ? await fetchPokefutaRows(supabase, user?.id ?? null)
    : [];
  const isDemo = !supabase;
  const demoOwnedCounts = [8, 4, 2, 6, 1, 3];
  const displayRows = rows.length > 0
    ? isDemo
      ? rows.map((row, index) => ({
          ...row,
          owned_count: demoOwnedCounts[index] ?? 0,
        }))
      : rows
    : demoRows;

  return (
    <BoardPostFormClient
      pokefutaRows={displayRows}
      poster={user ?? { user_id: "demo-user", nickname: "デモ利用者" }}
    />
  );
}
