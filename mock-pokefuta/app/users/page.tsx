import UsersListClient, { type UserListItem } from "./UsersListClient";
import { createClient } from "../lib/supabase/server";
import {
  PREFECTURE_LABELS,
  REGION_LABELS,
  REGION_ORDER,
} from "../utils/pokefutaGrouping";

type UserRow = {
  id: string;
  user_id: string | null;
  nickname: string | null;
  created_at: string | null;
};

type OwnershipRow = {
  user_id: string;
  pokefuta_id: number;
  count: number;
};

export default async function UsersPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <UsersListClient users={[]} isReady={false} />
      </main>
    );
  }

  const [
    { data: usersData },
    { data: ownershipData },
    { data: pokefutaData },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, user_id, nickname, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("ownership").select("user_id, pokefuta_id, count"),
    supabase
      .from("pokefuta")
      .select("id, region_id, prefecture_id"),
  ]);

  const ownershipMap = new Map<string, number>();
  const pokefutaMetaMap = new Map<
    number,
    { regionId: number; prefectureId: number | null }
  >(
    (pokefutaData ?? []).map((row) => [
      row.id,
      {
        regionId: row.region_id,
        prefectureId: row.prefecture_id,
      },
    ])
  );
  const userTypeSummary = new Map<
    string,
    {
      ownedIds: Set<number>;
      regionCounts: Map<number, number>;
      prefectureCounts: Map<number, number>;
    }
  >();
  (ownershipData ?? []).forEach((row: OwnershipRow) => {
    ownershipMap.set(
      row.user_id,
      (ownershipMap.get(row.user_id) ?? 0) + row.count
    );
    if (row.count <= 0) return;
    const meta = pokefutaMetaMap.get(row.pokefuta_id);
    if (!meta) return;
    const summary =
      userTypeSummary.get(row.user_id) ?? {
        ownedIds: new Set<number>(),
        regionCounts: new Map<number, number>(),
        prefectureCounts: new Map<number, number>(),
      };
    if (!summary.ownedIds.has(row.pokefuta_id)) {
      summary.ownedIds.add(row.pokefuta_id);
      summary.regionCounts.set(
        meta.regionId,
        (summary.regionCounts.get(meta.regionId) ?? 0) + 1
      );
      const prefectureId = meta.prefectureId ?? 0;
      summary.prefectureCounts.set(
        prefectureId,
        (summary.prefectureCounts.get(prefectureId) ?? 0) + 1
      );
    }
    userTypeSummary.set(row.user_id, summary);
  });
  const totalPokefutaCount = (pokefutaData ?? []).length;

  const users: UserListItem[] = (usersData ?? []).map((row: UserRow) => {
    const ownershipKey = row.id;
    const resolvedUserId = row.user_id ?? row.id;
    const summary = userTypeSummary.get(ownershipKey);
    const regionCounts = REGION_ORDER.flatMap((regionId) => {
      const count = summary?.regionCounts.get(regionId) ?? 0;
      if (!count) return [];
      return [
        {
          id: regionId,
          label: REGION_LABELS[regionId] ?? `地域${regionId}`,
          count,
        },
      ];
    });
    const prefectureCounts = Array.from(
      summary?.prefectureCounts.entries() ?? []
    )
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a - b)
      .map(([prefectureId, count]) => ({
        id: prefectureId,
        label:
          PREFECTURE_LABELS[prefectureId] ??
          (prefectureId === 0
            ? "未設定"
            : `都道府県${prefectureId}`),
        count,
      }));
    return {
      id: row.id,
      userId: resolvedUserId,
      name: row.nickname ?? row.user_id ?? "未設定",
      pokefutaCount: ownershipMap.get(ownershipKey) ?? 0,
      ownedTypesCount: summary?.ownedIds.size ?? 0,
      totalPokefutaCount,
      regionCounts,
      prefectureCounts,
      registeredAt: row.created_at ?? "",
    };
  });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <UsersListClient users={users} isReady />
    </main>
  );
}
