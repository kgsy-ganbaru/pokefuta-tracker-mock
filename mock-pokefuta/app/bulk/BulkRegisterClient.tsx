"use client";

import {
  buildRegionSections,
  getPrefectureName,
  REGION_LABELS,
} from "../utils/pokefutaGrouping";
import { PokefutaRow } from "../lib/pokefuta/listData";
import { getRankClass } from "../utils/rankColor";

export default function BulkRegisterClient({
  pokefutaRows,
  isLoggedIn,
}: {
  pokefutaRows: PokefutaRow[];
  isLoggedIn: boolean;
}) {
  const regionSections = buildRegionSections(pokefutaRows);

  return (
    <main className="max-w-3xl mx-auto px-4 pb-24">
      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">一括登録</h2>
        <p className="text-sm text-gray-500">
          登録済みのポケふたはスキップされます。
        </p>
        {!isLoggedIn && (
          <p className="text-sm text-red-500 mt-2">
            一括登録を行うにはログインが必要です。
          </p>
        )}
      </section>

      <section className="mt-6">
        {regionSections.map(
          ({ regionId, rows, rowsByPrefectureId, prefectureIdsToRender }) => (
            <div key={regionId} className="mb-12">
              <h3 className="font-semibold mb-3">
                {REGION_LABELS[regionId]}
              </h3>

              {rows.length === 0 && (
                <p className="text-sm text-gray-400">データがありません</p>
              )}

              {prefectureIdsToRender.map((prefectureId) => {
                const prefectureRows =
                  rowsByPrefectureId.get(prefectureId) ?? [];
                const prefectureName = getPrefectureName(prefectureId);
                return (
                  <div
                    key={`${regionId}-${prefectureId}`}
                    className="mb-6"
                  >
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">
                      {prefectureName}
                    </h4>
                    {prefectureRows.map((p) => {
                      const isOwned = p.owned_count > 0;
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-4 py-4 border-b"
                        >
                          <input
                            type="checkbox"
                            disabled={!isLoggedIn || isOwned}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {p.pokemon_names}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.city_name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 min-w-[72px] text-right">
                            {isOwned ? "登録済み" : "未登録"}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getRankClass(
                              p.difficulty_code
                            )}`}
                          >
                            {p.difficulty_code}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )
        )}
      </section>
    </main>
  );
}
