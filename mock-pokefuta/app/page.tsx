import HomeClient from "./components/HomeClient";
import { createClient } from "./lib/supabase/server";
import { getAuthProfile } from "./lib/supabase/auth";

export const dynamic = "force-dynamic";

type RecentRow = {
  id: number;
  address: string;
  image_url: string | null;
  pokemon_names: string;
  user_names: string;
};

type PokefutaRow = {
  id: number;
  region_id: number;
  prefecture_order: number | null;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string;
  owned_count: number;
};

type PokemonRow = {
  pokemon_name: string;
  display_order: number | null;
};

type PokefutaRecord = {
  id: number;
  region_id: number;
  prefecture_order: number | null;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokefuta_pokemon: PokemonRow[] | null;
};

type RecentOwnership = {
  pokefuta: {
    id: number;
    address: string;
    image_url: string | null;
    pokefuta_pokemon: PokemonRow[] | null;
  } | null;
  users: {
    nickname: string | null;
  } | null;
};

function formatPokemonNames(rows: PokemonRow[] | null) {
  if (!rows?.length) return "";
  return rows
    .slice()
    .sort(
      (a, b) =>
        (a.display_order ?? 0) - (b.display_order ?? 0)
    )
    .map((row) => row.pokemon_name)
    .join(" / ");
}

export default async function Page() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);

  if (!supabase) {
    return <HomeClient recentRows={[]} pokefutaRows={[]} />;
  }

  const { data: recentData } = await supabase
    .from("ownership")
    .select(
      "updated_at, pokefuta:pokefuta_id (id, address, image_url, pokefuta_pokemon (pokemon_name, display_order)), users (nickname)"
    )
    .order("updated_at", { ascending: false })
    .limit(5);

  const recentRows: RecentRow[] = (recentData ?? [])
    .map((row: RecentOwnership) => ({
      id: row.pokefuta?.id ?? 0,
      address: row.pokefuta?.address ?? "",
      image_url: row.pokefuta?.image_url ?? null,
      pokemon_names: formatPokemonNames(
        row.pokefuta?.pokefuta_pokemon ?? []
      ),
      user_names: row.users?.nickname ?? "",
    }))
    .filter((row) => row.id !== 0);

  const { data: pokefutaData } = await supabase
    .from("pokefuta")
    .select(
      "id, region_id, prefecture_order, address, difficulty_code, image_url, pokefuta_pokemon (pokemon_name, display_order)"
    )
    .order("region_id", { ascending: true })
    .order("prefecture_order", { ascending: true });

  const { data: ownershipData } = user
    ? await supabase
        .from("ownership")
        .select("pokefuta_id, count")
        .eq("user_id", user.id)
    : { data: [] };

  const ownershipMap = new Map<number, number>(
    (ownershipData ?? []).map((row) => [row.pokefuta_id, row.count])
  );

  const pokefutaRows: PokefutaRow[] = (pokefutaData ?? []).map(
    (row: PokefutaRecord) => ({
      id: row.id,
      region_id: row.region_id,
      prefecture_order: row.prefecture_order,
      address: row.address,
      difficulty_code: row.difficulty_code,
      image_url: row.image_url,
      pokemon_names: formatPokemonNames(row.pokefuta_pokemon),
      owned_count: ownershipMap.get(row.id) ?? 0,
    })
  );

  return (
    <HomeClient
      recentRows={recentRows}
      pokefutaRows={pokefutaRows}
    />
  );
}
