"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildRegionSections,
  getPrefectureName,
  REGION_LABELS,
} from "../utils/pokefutaGrouping";
import { PokefutaRow } from "../lib/pokefuta/listData";

export default function BulkRegisterClient({
  pokefutaRows,
  isLoggedIn,
}: {
  pokefutaRows: PokefutaRow[];
  isLoggedIn: boolean;
}) {
  type BulkSelection = {
    id: number;
    region_id: number;
    prefecture_id: number | null;
    city_name: string;
    image_url: string | null;
    pokemon_names: string;
    count: number;
  };

  const router = useRouter();
  const regionSections = buildRegionSections(pokefutaRows);
  const [expandedRegionIds, setExpandedRegionIds] = useState<
    Set<number>
  >(new Set());
  const [expandedPrefectureIds, setExpandedPrefectureIds] = useState<
    Set<number>
  >(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);

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
    if (typeof window === "undefined") {
      setCounts(initialCounts);
      setTouchedIds(new Set());
      return;
    }

    const stored = window.localStorage.getItem(
      "bulkUpdateSelections"
    );
    if (!stored) {
      setCounts(initialCounts);
      setTouchedIds(new Set());
      return;
    }

    try {
      const parsed = JSON.parse(stored) as BulkSelection[];
      const storedCounts: Record<number, number> = {};
      const storedTouched = new Set<number>();
      if (Array.isArray(parsed)) {
        parsed.forEach((row) => {
          storedCounts[row.id] = row.count;
          storedTouched.add(row.id);
        });
      }
      setCounts({ ...initialCounts, ...storedCounts });
      setTouchedIds(storedTouched);
    } catch {
      setCounts(initialCounts);
      setTouchedIds(new Set());
    }
  }, [initialCounts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleRegion = (
    regionId: number,
    prefectureIdsToRender: number[]
  ) => {
    setExpandedRegionIds((prev) => {
      const next = new Set(prev);
      if (next.has(regionId)) {
        next.delete(regionId);
        setExpandedPrefectureIds((prevPrefectures) => {
          const nextPrefectures = new Set(prevPrefectures);
          prefectureIdsToRender.forEach((prefectureId) => {
            nextPrefectures.delete(prefectureId);
          });
          return nextPrefectures;
        });
      } else {
        next.add(regionId);
      }
      return next;
    });
  };

  const togglePrefecture = (prefectureId: number) => {
    setExpandedPrefectureIds((prev) => {
      const next = new Set(prev);
      if (next.has(prefectureId)) {
        next.delete(prefectureId);
      } else {
        next.add(prefectureId);
      }
      return next;
    });
  };

  const updateCount = (id: number, nextCount: number) => {
    const clamped = Math.min(99, Math.max(0, nextCount));
    setCounts((prev) => ({ ...prev, [id]: clamped }));
    setTouchedIds((prev) => {
      const next = new Set(prev);
      const baseline = initialCounts[id] ?? 0;
      if (clamped === baseline) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    if (!isLoggedIn || typeof window === "undefined") {
      return;
    }

    const selections: BulkSelection[] = pokefutaRows
      .map((row) => {
        const count = counts[row.id] ?? 0;
        const baseline = initialCounts[row.id] ?? 0;
        if (count === baseline) {
          return null;
        }
        return {
          id: row.id,
          region_id: row.region_id,
          prefecture_id: row.prefecture_id,
          city_name: row.city_name,
          image_url: row.image_url,
          pokemon_names: row.pokemon_names,
          count,
        };
      })
      .filter((row): row is BulkSelection => row !== null);

    window.localStorage.setItem(
      "bulkUpdateSelections",
      JSON.stringify(selections)
    );
    router.push("/bulk/confirm");
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

        <section className="mt-8 space-y-6">
          {regionSections.map((section) => {
            const isRegionExpanded = expandedRegionIds.has(
              section.regionId
            );
            return (
              <div
                key={section.regionId}
                className="rounded-2xl border bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleRegion(
                      section.regionId,
                      section.prefectureIdsToRender
                    )
                  }
                  className={`w-full px-4 py-3 text-left text-sm font-semibold flex items-center justify-between transition ${
                    isRegionExpanded
                      ? "text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span>{REGION_LABELS[section.regionId]}</span>
                  <span className="text-xs text-gray-400">
                    {isRegionExpanded ? "閉じる" : "開く"}
                  </span>
                </button>
                {isRegionExpanded ? (
                  section.prefectureIdsToRender.length > 0 ? (
                    <div className="border-t px-4 py-3 flex flex-wrap gap-2">
                      {section.prefectureIdsToRender.map(
                        (prefectureId) => {
                          const prefectureName =
                            getPrefectureName(prefectureId);
                          const isPrefectureExpanded =
                            expandedPrefectureIds.has(
                              prefectureId
                            );
                          return (
                            <button
                              key={prefectureId}
                              type="button"
                              onClick={() =>
                                togglePrefecture(prefectureId)
                              }
                              className={`px-3 py-2 rounded-full border text-sm transition ${
                                isPrefectureExpanded
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              {prefectureName}
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="border-t px-4 py-3 text-sm text-gray-400">
                      データがありません
                    </p>
                  )
                ) : null}

                {isRegionExpanded &&
                  section.prefectureIdsToRender.map(
                    (prefectureId) => {
                      const isPrefectureExpanded =
                        expandedPrefectureIds.has(
                          prefectureId
                        );
                      if (!isPrefectureExpanded) {
                        return null;
                      }
                      const rows =
                        section.rowsByPrefectureId.get(
                          prefectureId
                        ) ?? [];
                      return (
                        <div
                          key={prefectureId}
                          className="border-t px-4 py-5"
                        >
                          <h4 className="text-sm font-semibold text-gray-600 mb-2">
                            {getPrefectureName(prefectureId)}
                          </h4>
                          {rows.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              データがありません
                            </p>
                          ) : (
                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                              {rows.map((p) => {
                                const count = counts[p.id] ?? 0;
                                const isOwned =
                                  p.owned_count > 0;
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
                                    className={`border rounded-xl p-1.5 text-center cursor-pointer transition shadow-sm ${bgClass} ${
                                      isLoggedIn
                                        ? "hover:shadow-md"
                                        : "opacity-60 cursor-not-allowed"
                                    }`}
                                  >
                                    <img
                                      src={
                                        p.image_url ||
                                        "/no-image.png"
                                      }
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
                                          updateCount(
                                            p.id,
                                            count - 1
                                          );
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
                                          updateCount(
                                            p.id,
                                            count + 1
                                          );
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
                          )}
                        </div>
                      );
                    }
                  )}
              </div>
            );
          })}
        </section>
      </main>

      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="w-48 rounded-full border border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 shadow-lg hover:bg-gray-50"
          >
            一覧へ戻る
          </Link>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isLoggedIn}
            className="w-36 rounded-full bg-green-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-green-700 disabled:bg-gray-300"
          >
            更新
          </button>
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-20 right-6 w-12 h-12 rounded-full bg-blue-600 text-white text-xl shadow-lg z-50"
          aria-label="ページの先頭へ戻る"
        >
          ↑
        </button>
      )}
    </>
  );
}
