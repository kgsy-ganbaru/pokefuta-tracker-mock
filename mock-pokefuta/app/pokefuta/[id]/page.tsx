import { createClient } from "@/app/lib/supabase/server";
import { getAuthProfile } from "@/app/lib/supabase/auth";
import DetailClient from "./DetailClient";

export const dynamic = "force-dynamic";

type PokemonRow = {
  pokemon_name: string;
  display_order: number | null;
};

type PokefutaDetail = {
  id: number;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  region_id: number | null;
  prefecture_id: number | null;
  pokefuta_pokemon: PokemonRow[] | null;
};

type OwnerRow = {
  users: {
    nickname: string | null;
  } | null;
  count: number;
};

function formatPokemonNames(rows: PokemonRow[] | null) {
  if (!rows?.length) return [] as string[];
  return rows
    .slice()
    .sort(
      (a, b) =>
        (a.display_order ?? 0) - (b.display_order ?? 0)
    )
    .map((row) => row.pokemon_name);
}

export default async function PokefutaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (Number.isNaN(numericId)) {
    return <p className="p-4">不正なIDです</p>;
  }

  const supabase = createClient();
  const user = await getAuthProfile();

  const { data: pokefuta } = await supabase
    .from("pokefuta")
    .select(
      "id, address, difficulty_code, image_url, region_id, prefecture_id, pokefuta_pokemon (pokemon_name, display_order)"
    )
    .eq("id", numericId)
    .maybeSingle();

  if (!pokefuta) {
    return <p className="p-4">該当するポケふたが見つかりません</p>;
  }

  const { data: ownersData } = await supabase
    .from("ownership")
    .select("count, users (nickname)")
    .eq("pokefuta_id", numericId)
    .order("count", { ascending: false });

  const { data: myOwnership } = user
    ? await supabase
        .from("ownership")
        .select("count")
        .eq("pokefuta_id", numericId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <DetailClient
      pokefuta={{
        ...pokefuta,
        pokemon_names: formatPokemonNames(
          pokefuta.pokefuta_pokemon
        ),
      }}
      owners={(ownersData ?? []).map((row: OwnerRow) => ({
        nickname: row.users?.nickname ?? "",
        count: row.count,
      }))}
      isLoggedIn={!!user}
      initialCount={myOwnership?.count ?? 0}
      regionLabel={
        pokefuta.region_id ? `地域${pokefuta.region_id}` : ""
      }
      prefectureLabel={
        pokefuta.prefecture_id
          ? `都道府県${pokefuta.prefecture_id}`
          : ""
      }
    />
  );
}