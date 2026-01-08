"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PokefutaRow, RecentRow } from "../lib/pokefuta/listData";
import {
  buildRegionSections,
  getPrefectureName,
  REGION_LABELS,
  REGION_ORDER,
} from "../utils/pokefutaGrouping";
import { getRankClass } from "../utils/rankColor";

/* =====================
   型定義
===================== */

/* =====================
   Component
===================== */
export default function HomeClient({
  recentRows,
  pokefutaRows,
}: {
  recentRows: RecentRow[];
  pokefutaRows: PokefutaRow[];
}) {
  const router = useRouter();
  const formatRecentDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const [activeRegionId, setActiveRegionId] = useState<
    number | null
  >(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sectionRefs = useRef<
    Record<string, HTMLDivElement | null>
  >({});
  const saveScrollPosition = () => {
    sessionStorage.setItem(
      "pokefuta-scroll-y",
      String(window.scrollY)
    );
  };

  const regionSections = buildRegionSections(pokefutaRows);
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
  useEffect(() => {
    const savedScroll =
      sessionStorage.getItem("pokefuta-scroll-y");
    if (!savedScroll) return;
    const scrollY = Number(savedScroll);
    if (!Number.isNaN(scrollY)) {
      window.scrollTo({ top: scrollY });
    }
    sessionStorage.removeItem("pokefuta-scroll-y");
  }, []);

  return (
    <>
      <main
        id="scroll-root"
        className="max-w-3xl mx-auto px-4 pb-24"
      >
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => router.push("/bulk")}
            className="px-3 py-2 rounded-lg pft-primary-button text-sm font-semibold"
          >
            一括登録
          </button>
        </div>

        {/* =====================
            最近ゲット
        ===================== */}
        <section className="mt-4">
          <h2 className="text-base font-semibold mb-3 pft-section-title flex items-center gap-2">
            <img
              src="/status-any-owned-pokeball.svg"
              alt=""
              aria-hidden="true"
              className="w-4 h-4"
            />
            <span>最近ゲット</span>
            <img
              src="/status-any-owned-pokeball.svg"
              alt=""
              aria-hidden="true"
              className="w-4 h-4"
            />
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentRows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  saveScrollPosition();
                  router.push(`/pokefuta/${r.id}`);
                }}
                className="min-w-[176px] rounded-xl p-3 text-left cursor-pointer pft-card"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={r.image_url || "/no-image.png"}
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src =
                        "/no-image.png")
                    }
                    className="w-16 h-16 rounded-xl object-cover"
                    alt=""
                  />

                  <div className="mt-2 min-h-[2.6rem] text-[0.7rem] font-medium leading-snug flex items-center justify-center">
                    {r.pokemon_names}
                  </div>

                  <div className="min-h-[1rem] text-xs text-gray-500">
                    {r.city_name}
                  </div>

                  <div className="min-h-[1rem] text-xs text-gray-600">
                    {r.user_names}
                  </div>

                  <div className="min-h-[0.9rem] text-[0.65rem] text-gray-400">
                    {formatRecentDate(r.last_get_at)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================
            地域ナビ
        ===================== */}
        <section className="mt-8 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {REGION_ORDER.map((id) => (
              <button
                key={id}
                onClick={() => setActiveRegionId(id)}
                className="px-4 py-2 rounded-full text-sm whitespace-nowrap pft-chip"
              >
                {REGION_LABELS[id]}
              </button>
            ))}
          </div>
        </section>

        {/* =====================
            一覧
        ===================== */}
        <section>
          {regionSections.map(
            ({ regionId, rows, rowsByPrefectureId, prefectureIdsToRender }) => (
              <div
                key={regionId}
                className="mb-12"
              >
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
                    rowsByPrefectureId.get(prefectureId) ??
                    [];
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
                      <h4 className="text-sm font-semibold text-gray-600 mb-2 pft-section-title">
                        {prefectureName}
                      </h4>
                      {prefectureRows.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            saveScrollPosition();
                            router.push(`/pokefuta/${p.id}`);
                          }}
                          className="flex items-center gap-4 py-4 cursor-pointer pft-row"
                        >
                          <img
                            src={p.image_url || "/no-image.png"}
                            onError={(e) =>
                              ((e.currentTarget as HTMLImageElement).src =
                                "/no-image.png")
                            }
                            className="w-12 h-12 rounded-full object-cover"
                            alt=""
                          />

                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {p.pokemon_names}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.city_name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 min-w-[72px] justify-end">
                            {p.owned_count > 0 && (
                              <span className="text-xs font-semibold text-gray-700">
                                {p.owned_count}枚
                              </span>
                            )}
                            <span className="inline-flex w-4 justify-center">
                              {Math.max(
                                0,
                                p.any_owned_count - p.owned_count
                              ) > 0 && (
                                <Image
                                  src="/status-any-owned-pokeball.svg"
                                  alt="他のユーザが取得済み"
                                  title="他のユーザが取得済み"
                                  width={16}
                                  height={16}
                                />
                              )}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getRankClass(
                              p.difficulty_code
                            )}`}
                          >
                            {p.difficulty_code}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </section>
      </main>

      {activeRegionId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
          onClick={() => setActiveRegionId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-4 pft-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3">
              <div className="text-sm font-semibold">
                {REGION_LABELS[activeRegionId]}の都道府県
              </div>
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
                    className="px-3 py-2 rounded-lg text-sm text-left pft-chip"
                  >
                    {prefectureName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================
          トップへ戻る
      ===================== */}
      {showBackToTop && (
        <button
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full text-white text-xl shadow-lg z-50 pft-primary-button"
          aria-label="ページの先頭へ戻る"
        >
          ↑
        </button>
      )}
    </>
  );
}
