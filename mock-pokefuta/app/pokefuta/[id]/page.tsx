import { createClient } from "@/app/lib/supabase/server";
import { getCachedAuthProfile } from "@/app/lib/supabase/auth";
import DetailClient from "./DetailClient";

export const dynamic = "force-dynamic";

type PokemonRow = {
  pokemon_name: string;
  display_order: number | null;
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
    return <p className="p-4">正しいページを開けませんでした。</p>;
  }

  const supabase = await createClient();
  const user = await getCachedAuthProfile();

  if (!supabase) {
    return <p className="p-4">ポケふたの情報を取得できませんでした。</p>;
  }

  const pokefutaQuery = supabase
    .from("pokefuta")
    .select(
      "id, address, difficulty_code, image_url, pokefuta_pokemon (pokemon_name, display_order)"
    )
    .eq("id", numericId)
    .eq("is_active", true)
    .maybeSingle();

  const ownersQuery = supabase
    .from("ownership")
    .select("count, users (nickname)")
    .eq("pokefuta_id", numericId)
    .order("count", { ascending: false });

  const myOwnershipQuery = user
    ? supabase
        .from("ownership")
        .select("count")
        .eq("pokefuta_id", numericId)
        .eq("user_id", user.id)
        .maybeSingle()
    : Promise.resolve({ data: null });

  const [
    { data: pokefuta },
    { data: ownersData },
    { data: myOwnership },
  ] = await Promise.all([
    pokefutaQuery,
    ownersQuery,
    myOwnershipQuery,
  ]);

  if (!pokefuta) {
    return <p className="p-4">該当するポケふたが見つかりませんでした。</p>;
  }

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
    />
  );
}
