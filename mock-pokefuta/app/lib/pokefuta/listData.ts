import { SupabaseClient } from "@supabase/supabase-js";

export type RecentRow = {
  id: number;
  city_name: string;
  image_url: string | null;
  pokemon_names: string;
  user_names: string;
};

export type PokefutaRow = {
  id: number;
  region_id: number;
  prefecture_id: number | null;
  city_name: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string;
  owned_count: number;
  any_owned_count: number;
};

type PokemonRow = {
  pokemon_name: string;
  display_order: number | null;
};

type PokefutaRecord = {
  id: number;
  region_id: number;
  prefecture_id: number | null;
  city_name: string;
  difficulty_code: string;
  image_url: string | null;
  pokefuta_pokemon: PokemonRow[] | null;
};

type RecentOwnership = {
  pokefuta:
    | {
        id: number;
        city_name: string;
        image_url: string | null;
        pokefuta_pokemon: PokemonRow[] | null;
      }[]
    | null;
  users:
    | {
        nickname: string | null;
      }[]
    | null;
};

export function formatPokemonNames(rows: PokemonRow[] | null) {
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

export async function fetchRecentRows(
  supabase: SupabaseClient
): Promise<RecentRow[]> {
  const { data: recentData } = await supabase
    .from("ownership")
    .select(
      "updated_at, pokefuta:pokefuta_id (id, city_name, image_url, pokefuta_pokemon (pokemon_name, display_order)), users (nickname)"
    )
    .order("updated_at", { ascending: false })
    .limit(5);

  return (recentData ?? [])
    .map((row: RecentOwnership) => {
      const pokefuta = row.pokefuta?.[0] ?? null;
      const user = row.users?.[0] ?? null;

      return {
        id: pokefuta?.id ?? 0,
        city_name: pokefuta?.city_name ?? "",
        image_url: pokefuta?.image_url ?? null,
        pokemon_names: formatPokemonNames(
          pokefuta?.pokefuta_pokemon ?? []
        ),
        user_names: user?.nickname ?? "",
      };
    })
    .filter((row) => row.id !== 0);
}

export async function fetchPokefutaRows(
  supabase: SupabaseClient,
  userId: string | null
): Promise<PokefutaRow[]> {
  const { data: pokefutaData } = await supabase
    .from("pokefuta")
    .select(
      "id, region_id, prefecture_id, city_name, difficulty_code, image_url, pokefuta_pokemon (pokemon_name, display_order)"
    )
    .order("region_id", { ascending: true })
    .order("prefecture_id", { ascending: true });

  const { data: ownershipData } = userId
    ? await supabase
        .from("ownership")
        .select("pokefuta_id, count")
        .eq("user_id", userId)
    : { data: [] };

  const ownershipMap = new Map<number, number>(
    (ownershipData ?? []).map((row) => [row.pokefuta_id, row.count])
  );

  const { data: anyOwnershipData } = await supabase
    .from("ownership")
    .select("pokefuta_id, count");

  const anyOwnershipMap = new Map<number, number>();
  (anyOwnershipData ?? []).forEach((row) => {
    anyOwnershipMap.set(
      row.pokefuta_id,
      (anyOwnershipMap.get(row.pokefuta_id) ?? 0) + row.count
    );
  });

  return (pokefutaData ?? []).map((row: PokefutaRecord) => ({
    id: row.id,
    region_id: row.region_id,
    prefecture_id: row.prefecture_id,
    city_name: row.city_name,
    difficulty_code: row.difficulty_code,
    image_url: row.image_url,
    pokemon_names: formatPokemonNames(row.pokefuta_pokemon),
    owned_count: ownershipMap.get(row.id) ?? 0,
    any_owned_count: anyOwnershipMap.get(row.id) ?? 0,
  }));
}
