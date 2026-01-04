"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildRegionSections,
  getPrefectureName,
  REGION_LABELS,
  REGION_ORDER,
} from "../utils/pokefutaGrouping";
import { PokefutaRow } from "../lib/pokefuta/listData";

export default function BulkRegisterClient({
  pokefutaRows,
  isLoggedIn,
}: {
  pokefutaRows: PokefutaRow[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const regionSections = buildRegionSections(pokefutaRows);
  const [activeRegionId, setActiveRegionId] = useState<number | null>(
    null
  );
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>(
    {}
  );

  const initialCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    pokefutaRows.forEach((row) => {
      if (row.owned_count > 0) {
        counts[row.id] = row.owned_count;
      }
    });
    return counts;
  }, [pokefutaRows]);

  const [counts, setCounts] = useState<Record<number, number>>(
    initialCounts
  );
  const [touchedIds, setTouchedIds] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    setCounts(initialCounts);
    setTouchedIds(new Set());
  }, [initialCounts]);

  const activePrefectureIds =
    activeRegionId !== null
      ? regionSections.find(
          (section) => section.regionId === activeRegionId
        )?.prefectureIdsToRender ?? []
      : [];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateCount = (id: number, nextCount: number) => {
    const clamped = Math.min(99, Math.max(0, nextCount));
    setCounts((prev) => ({ ...prev, [id]: clamped }));
    setTouchedIds((prev) => {
      const next = new Set(prev);
      if (clamped === 0) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 pb-32">
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">一括登録</h2>
          <p className="text-sm text-gray-500">
            クリックで2枚に設定。既に登録済みのデータは黄色で表示されます。
          </p>
          {!isLoggedIn && (
            <p className="text-sm text-red-500 mt-2">
              一括登録を行うにはログインが必要です。
            </p>
          )}
        </section>

        <section className="mt-8 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {REGION_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setActiveRegionId(id)}
                className="px-4 py-2 rounded-full border text-sm whitespace-nowrap"
              >
                {REGION_LABELS[id]}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          {regionSections.map(
            ({ regionId, rows, rowsByPrefectureId, prefectureIdsToRender }) => (
              <div key={regionId} className="mb-12">
                <h3 className="font-semibold mb-3">
                  {REGION_LABELS[regionId]}
                </h3>

                {rows.length === 0 && (
                  <p className="text-sm text-gray-400">
                    データがありません
                  </p>
                )}

                {prefectureIdsToRender.map((prefectureId) => {
                  const prefectureRows =
                    rowsByPrefectureId.get(prefectureId) ?? [];
                  const prefectureName =
                    getPrefectureName(prefectureId);
                  return (
                    <div
                      key={`${regionId}-${prefectureId}`}
                      ref={(el) => {
                        sectionRefs.current[
                          `${regionId}-${prefectureId}`
                        ] = el;
                      }}
                      className="mb-6"
                    >
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">
                        {prefectureName}
                      </h4>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                        {prefectureRows.map((p) => {
                          const count =
                            counts[p.id] ?? 0;
                          const isOwned = p.owned_count > 0;
                          const isTouched =
                            touchedIds.has(p.id);
                          const isSelected = count > 0;
                          const bgClass = isSelected
                            ? isOwned && !isTouched
                              ? "bg-yellow-100"
                              : "bg-lime-200"
                            : isOwned
                              ? "bg-yellow-100"
                              : "bg-white";
                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                if (!isLoggedIn) return;
                                updateCount(
                                  p.id,
                                  count === 0 ? 2 : 0
                                );
                              }}
                              className={`border rounded-xl p-2 text-center cursor-pointer transition shadow-sm ${bgClass} ${
                                isLoggedIn
                                  ? "hover:shadow-md"
                                  : "opacity-60 cursor-not-allowed"
                              }`}
                            >
                              <img
                                src={p.image_url || "/no-image.png"}
                                onError={(e) =>
                                  ((e.currentTarget as HTMLImageElement).src =
                                    "/no-image.png")
                                }
                                className="w-full aspect-square rounded-full object-cover"
                                alt=""
                              />
                              <div className="mt-2 flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (!isLoggedIn) return;
                                    updateCount(p.id, count - 1);
                                  }}
                                  className="h-7 w-7 rounded-full border text-sm font-semibold"
                                >
                                  −
                                </button>
                                <span className="min-w-[24px] text-sm font-semibold text-gray-700">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (!isLoggedIn) return;
                                    updateCount(p.id, count + 1);
                                  }}
                                  className="h-7 w-7 rounded-full border text-sm font-semibold"
                                >
                                  ＋
                                </button>
                              </div>
                              <div className="mt-2 text-xs font-semibold text-gray-700">
                                {p.city_name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>
      </main>

      {activeRegionId !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                {REGION_LABELS[activeRegionId]}の都道府県
              </div>
              <button
                onClick={() => setActiveRegionId(null)}
                className="text-sm text-gray-500"
              >
                閉じる
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activePrefectureIds.map((prefectureId) => {
                const prefectureName =
                  getPrefectureName(prefectureId);
                return (
                  <button
                    key={prefectureId}
                    onClick={() => {
                      sectionRefs.current[
                        `${activeRegionId}-${prefectureId}`
                      ]?.scrollIntoView({ behavior: "smooth" });
                      setActiveRegionId(null);
                      setShowBackToTop(true);
                    }}
                    className="px-3 py-2 rounded-lg border text-sm text-left hover:bg-gray-50"
                  >
                    {prefectureName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showBackToTop && (
        <button
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white text-xl shadow-lg z-50"
          aria-label="ページの先頭へ戻る"
        >
          ↑
        </button>
      )}

      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
        <button
          type="button"
          onClick={() => router.push("/bulk/confirm")}
          disabled={!isLoggedIn}
          className="w-36 rounded-full bg-green-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-green-700 disabled:bg-gray-300"
        >
          更新
        </button>
      </div>
    </>
  );
}
