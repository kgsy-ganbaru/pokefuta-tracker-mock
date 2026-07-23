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

const BoardChanceIcon = () => (
  <span
    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700"
    title="掲示板で交換募集中"
    aria-label="掲示板で交換募集中"
  >
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h11l-3-3" />
      <path d="m18 7-3 3" />
      <path d="M17 17H6l3 3" />
      <path d="m6 17 3-3" />
    </svg>
  </span>
);

type StatusFilterId = "board-chance" | "other-owned" | "owned";

const StatusFilterIcon = ({ id }: { id: StatusFilterId }) => {
  if (id === "board-chance") return <BoardChanceIcon />;
  if (id === "other-owned") return <Image src="/status-any-owned-pokeball.svg" alt="" width={20} height={20} />;
  return <span className="inline-flex w-8 justify-center text-xs font-semibold text-gray-700">2枚</span>;
};

/* =====================
   型定義
===================== */

/* =====================
   Component
===================== */
export default function HomeClient({
  recentRows,
  pokefutaRows,
  boardChanceIds,
}: {
  recentRows: RecentRow[];
  pokefutaRows: PokefutaRow[];
  boardChanceIds: number[];
}) {
  const boardChanceIdSet = new Set(boardChanceIds);
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
  const [activeFilterId, setActiveFilterId] = useState<
    StatusFilterId | null
  >(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
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

  const filterOptions = [
    {
      id: "board-chance" as const,
      label: "掲示板で交換募集中",
      matches: (row: PokefutaRow) => boardChanceIdSet.has(row.id),
    },
    {
      id: "other-owned" as const,
      label: "自分以外の利用者が所持",
      matches: (row: PokefutaRow) =>
        Math.max(0, row.any_owned_count - row.owned_count) > 0,
    },
    {
      id: "owned" as const,
      label: "自分の所持枚数",
      matches: (row: PokefutaRow) => row.owned_count > 0,
    },
  ];
  const activeFilter = filterOptions.find(
    (option) => option.id === activeFilterId
  );
  const filteredRows = activeFilter
    ? pokefutaRows.filter(activeFilter.matches)
    : pokefutaRows;
  const regionSections = buildRegionSections(filteredRows);
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
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/bulk")}
            className="px-3 py-2 rounded-lg pft-primary-button text-sm font-semibold"
          >
            一括登録
          </button>
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            aria-label={activeFilter ? `フィルターを開く。現在: ${activeFilter.label}` : "フィルターを開く"}
            className="relative h-11 w-11 rounded-lg border border-gray-200 bg-white/80 text-gray-600 shadow-sm transition hover:bg-white pft-card"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="mx-auto h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h18l-7 8v6l-4 2v-8z" />
            </svg>
            {activeFilter && <span aria-hidden="true" className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
          </button>
        </div>

        {activeFilter && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span className="truncate">絞り込み中：{activeFilter.label}</span>
            <button type="button" onClick={() => setActiveFilterId(null)} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">解除</button>
          </div>
        )}

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

          {recentRows.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-white px-4 py-6 text-center text-sm text-gray-500">
              最近登録されたポケふたはありません。
            </p>
          ) : <div className="flex gap-3 overflow-x-auto pb-2">
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
          </div>}
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
                    表示できるポケふたがありません。
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
                          <div className="grid w-24 shrink-0 grid-cols-3 items-center justify-items-center">
                            <span className="inline-flex w-8 justify-center">
                              {boardChanceIdSet.has(p.id) && <BoardChanceIcon />}
                            </span>
                            <span className="inline-flex w-8 justify-center">
                              {Math.max(
                                0,
                                p.any_owned_count - p.owned_count
                              ) > 0 && (
                                <Image
                                  src="/status-any-owned-pokeball.svg"
                                  alt="他の利用者が所持"
                                  title="他の利用者が所持"
                                  width={20}
                                  height={20}
                                />
                              )}
                            </span>
                            <span className="inline-flex w-8 justify-center text-xs font-semibold text-gray-700">
                              {p.owned_count > 0 ? `${p.owned_count}枚` : ""}
                            </span>
                          </div>
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-dialog-title"
        >
          <div
            className="w-full max-w-md rounded-2xl p-4 pft-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div id="region-dialog-title" className="text-sm font-semibold">
                {REGION_LABELS[activeRegionId]}の都道府県
              </div>
              <button type="button" onClick={() => setActiveRegionId(null)} aria-label="閉じる" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600">×</button>
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

      {showFilterModal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
          onClick={() => setShowFilterModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-dialog-title"
        >
          <div
            className="w-full max-w-md rounded-2xl p-4 pft-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="filter-dialog-title" className="text-sm font-semibold">表示を絞り込む</h2>
              <button type="button" onClick={() => setShowFilterModal(false)} aria-label="閉じる" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600">×</button>
            </div>
            <div className="grid gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setActiveFilterId((current) =>
                      current === option.id ? null : option.id
                    );
                    setShowFilterModal(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-left pft-chip ${activeFilterId === option.id ? "ring-2 ring-emerald-400" : ""}`}
                >
                  <span className="inline-flex w-8 shrink-0 justify-center"><StatusFilterIcon id={option.id} /></span>
                  <span>{option.label}</span>
                </button>
              ))}
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
          className="pft-above-mobile-nav fixed right-6 z-40 h-12 w-12 rounded-full text-xl text-white shadow-lg pft-primary-button"
          aria-label="ページの先頭へ戻る"
        >
          ↑
        </button>
      )}
    </>
  );
}
