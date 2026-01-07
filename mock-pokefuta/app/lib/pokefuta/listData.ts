import { SupabaseClient } from "@supabase/supabase-js";

export type RecentRow = {
  id: number;
  city_name: string;
  image_url: string | null;
  pokemon_names: string;
  user_names: string;
  last_get_at: string;
};

export type PokefutaRow = {
  id: number;
  region_id: number;
  prefecture_id: number | null;
  prefecture_order: number | null;
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
  prefecture_order: number | null;
  city_name: string;
  difficulty_code: string;
  image_url: string | null;
  pokefuta_pokemon: PokemonRow[] | null;
};

type RecentPokefuta = {
  id: number;
  city_name: string;
  image_url: string | null;
  pokefuta_pokemon: PokemonRow[] | null;
};

type RecentUser = {
  nickname: string | null;
};

type RecentOwnership = {
  last_get_at: string | null;
  pokefuta: RecentPokefuta | RecentPokefuta[] | null;
  users: RecentUser | RecentUser[] | null;
};

type OwnershipCountRow = {
  pokefuta_id: number | string;
  count: number | string | null;
};

function takeFirst<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

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
      "last_get_at, pokefuta:pokefuta_id (id, city_name, image_url, pokefuta_pokemon (pokemon_name, display_order)), users (nickname)"
    )
    .order("last_get_at", { ascending: false })
    .limit(10);

  return (recentData ?? [])
    .map((row: RecentOwnership) => {
      if (!row.last_get_at) {
        return null;
      }
      const pokefuta = takeFirst(row.pokefuta);
      if (!pokefuta) {
        return null;
      }
      const user = takeFirst(row.users);

      return {
        id: pokefuta.id,
        city_name: pokefuta.city_name,
        image_url: pokefuta.image_url ?? null,
        pokemon_names: formatPokemonNames(
          pokefuta.pokefuta_pokemon ?? []
        ),
        user_names: user?.nickname ?? "",
        last_get_at: row.last_get_at,
      };
    })
    .filter((row): row is RecentRow => row !== null);
}

export async function fetchPokefutaRows(
  supabase: SupabaseClient,
  userId: string | null
): Promise<PokefutaRow[]> {
  const { data: pokefutaData } = await supabase
    .from("pokefuta")
    .select(
      "id, region_id, prefecture_id, prefecture_order, city_name, difficulty_code, image_url, pokefuta_pokemon (pokemon_name, display_order)"
    )
    .order("region_id", { ascending: true })
    .order("prefecture_id", { ascending: true })
    .order("prefecture_order", { ascending: true });

  const { data: ownershipData } = userId
    ? await supabase
        .from("ownership")
        .select("pokefuta_id, count")
        .eq("user_id", userId)
    : { data: [] };

  const ownershipMap = new Map<number, number>();
  (ownershipData ?? []).forEach((row: OwnershipCountRow) => {
    const pokefutaId = Number(row.pokefuta_id);
    if (!Number.isFinite(pokefutaId)) return;
    const count = Number(row.count ?? 0);
    ownershipMap.set(
      pokefutaId,
      (ownershipMap.get(pokefutaId) ?? 0) +
        (Number.isFinite(count) ? count : 0)
    );
  });

  const { data: anyOwnershipData } = await supabase
    .from("ownership")
    .select("pokefuta_id, count");

  const anyOwnershipMap = new Map<number, number>();
  (anyOwnershipData ?? []).forEach((row: OwnershipCountRow) => {
    const pokefutaId = Number(row.pokefuta_id);
    if (!Number.isFinite(pokefutaId)) return;
    const count = Number(row.count ?? 0);
    anyOwnershipMap.set(
      pokefutaId,
      (anyOwnershipMap.get(pokefutaId) ?? 0) +
        (Number.isFinite(count) ? count : 0)
    );
  });

  return (pokefutaData ?? []).map((row: PokefutaRecord) => ({
    id: row.id,
    region_id: row.region_id,
    prefecture_id: row.prefecture_id,
    prefecture_order: row.prefecture_order,
    city_name: row.city_name,
    difficulty_code: row.difficulty_code,
    image_url: row.image_url,
    pokemon_names: formatPokemonNames(row.pokefuta_pokemon),
    owned_count: ownershipMap.get(row.id) ?? 0,
    any_owned_count: anyOwnershipMap.get(row.id) ?? 0,
  }));
}
