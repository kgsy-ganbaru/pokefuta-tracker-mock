import { notFound } from "next/navigation";
import PageBackLink from "../../../../components/PageBackLink";
import { requireAdmin } from "../../../../lib/admin";
import { formatPokemonNames } from "../../../../lib/pokefuta/listData";
import PokefutaAdminForm from "../../PokefutaAdminForm";

type Row = { id: number; region_id: number; prefecture_id: number; city_name: string; address: string; image_url: string | null; pokefuta_pokemon: { pokemon_name: string; display_order: number | null }[] | null };

export default async function EditPokefutaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { admin } = await requireAdmin();
  const { data } = await admin.from("pokefuta").select("id, region_id, prefecture_id, city_name, address, image_url, pokefuta_pokemon (pokemon_name, display_order)").eq("id", Number(id)).maybeSingle();
  if (!data) notFound();
  const row = data as Row;
  return <main className="mx-auto max-w-2xl space-y-5 p-4 pb-28 sm:p-6"><PageBackLink href="/admin/pokefuta" label="ポケふた管理に戻る" /><header><h1 className="text-2xl font-bold text-gray-900">ポケふたを編集</h1></header><PokefutaAdminForm initialValues={{ id: row.id, regionId: row.region_id, prefectureId: row.prefecture_id, cityName: row.city_name, address: row.address, imageUrl: row.image_url, pokemonNames: formatPokemonNames(row.pokefuta_pokemon).replaceAll(" / ", "、") }} /></main>;
}
