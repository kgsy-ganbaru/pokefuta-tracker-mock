import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { fetchPokefutaRows } from "@/app/lib/pokefuta/listData";
import {
  buildRegionSections,
  getPrefectureName,
  REGION_LABELS,
} from "@/app/utils/pokefutaGrouping";

type UserDetailPageProps = {
  params: { userId: string };
};

type UserRow = {
  id: string;
  user_id: string | null;
  nickname: string | null;
};

export default async function UserDetailPage({
  params,
}: UserDetailPageProps) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <section className="mt-6">
          <h1 className="text-xl font-semibold mb-2">
            ユーザーのポケフタ状況
          </h1>
          <p className="text-sm text-gray-500">
            Supabaseの接続設定が未完了のため、詳細情報を取得できませんでした。
          </p>
        </section>
        <div className="mt-10">
          <Link
            href="/users"
            className="inline-flex items-center text-sm text-blue-600 hover:underline"
          >
            ユーザー一覧に戻る
          </Link>
        </div>
      </main>
    );
  }

  const { data: userRows } = await supabase
    .from("users")
    .select("id, user_id, nickname")
    .or(`user_id.eq.${params.userId},id.eq.${params.userId}`)
    .limit(1);

  const user = (userRows ?? [])[0] as UserRow | undefined;
  const userName =
    user?.nickname ?? user?.user_id ?? "ユーザー";
  const userId = user?.id ?? params.userId;

  const pokefutaRows = await fetchPokefutaRows(supabase, userId);
  const ownedRows = pokefutaRows.filter(
    (row) => row.owned_count > 0
  );
  const regionSections = buildRegionSections(ownedRows);

  return (
    <main className="max-w-7xl mx-auto px-4 pb-16">
      <section className="mt-6">
        <h1 className="text-xl font-semibold mb-2">
          {userName}さんのポケフタ状況
        </h1>
        <p className="text-sm text-gray-500">
          ユーザーが所持しているポケフタの一覧を確認できます。
        </p>
        <p className="text-sm font-semibold text-gray-700 mt-2">
          所持ポケフタ {ownedRows.length} 件
        </p>
      </section>

      <section className="mt-8">
        {ownedRows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-gray-500">
            所持しているポケフタがありません。
          </div>
        ) : (
          <div className="space-y-6">
            {regionSections.map((section) => {
              if (section.rows.length === 0) return null;
              return (
                <div
                  key={section.regionId}
                  className="rounded-2xl border bg-white p-4"
                >
                  <h2 className="text-sm font-semibold text-blue-700 mb-3">
                    {REGION_LABELS[section.regionId]}
                  </h2>
                  <div className="space-y-5">
                    {section.prefectureIdsToRender.map(
                      (prefectureId) => {
                        const entries =
                          section.rowsByPrefectureId.get(
                            prefectureId
                          ) ?? [];
                        if (entries.length === 0) return null;
                        return (
                          <div key={prefectureId}>
                            <h3 className="text-xs font-semibold text-gray-600 mb-2">
                              {getPrefectureName(
                                prefectureId === 0
                                  ? null
                                  : prefectureId
                              )}
                            </h3>
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                              {entries.map((row) => (
                                <div
                                  key={row.id}
                                  className="border rounded-xl p-2 text-center shadow-sm bg-white"
                                >
                                  <img
                                    src={
                                      row.image_url ||
                                      "/no-image.png"
                                    }
                                    onError={(e) =>
                                      ((e.currentTarget as HTMLImageElement).src =
                                        "/no-image.png")
                                    }
                                    className="w-full aspect-square rounded-full object-cover"
                                    alt=""
                                  />
                                  <div className="mt-2 text-xs font-semibold text-gray-700">
                                    {row.city_name}
                                  </div>
                                  <div className="mt-2 text-xs font-semibold text-emerald-600">
                                    登録数: {row.owned_count}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-center">
        <Link
          href="/users"
          className="w-48 rounded-full border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ユーザー一覧に戻る
        </Link>
      </div>
    </main>
  );
}
