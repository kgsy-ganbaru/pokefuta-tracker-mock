"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const REGION_HEADER_HEIGHT = 40;
  const PREFECTURE_HEADER_HEIGHT = 32;
  const ROW_HEIGHT = 76;
  const EMPTY_HEIGHT = 32;
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
  const [selectedRegionId, setSelectedRegionId] = useState<
    number | null
  >(null);
  const [selectedPrefectureId, setSelectedPrefectureId] = useState<
    number | null
  >(null);
  const [activeFilterId, setActiveFilterId] = useState<
    "owned" | "other-owned" | "unowned" | null
  >(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const listAnchorRef = useRef<HTMLDivElement | null>(null);
  const listTopOffset = useRef(0);
  const saveScrollPosition = () => {
    sessionStorage.setItem(
      "pokefuta-scroll-y",
      String(window.scrollY)
    );
  };

  const filterOptions = [
    {
      id: "owned" as const,
      label: "自分が所持しているポケフタ",
      matches: (row: PokefutaRow) => row.owned_count > 0,
    },
    {
      id: "other-owned" as const,
      label: "誰かが所持しているポケフタ",
      matches: (row: PokefutaRow) =>
        row.any_owned_count > 0 && row.owned_count === 0,
    },
    {
      id: "unowned" as const,
      label: "誰も所持していないポケフタ",
      matches: (row: PokefutaRow) =>
        row.any_owned_count === 0,
    },
  ];
  const activeFilter = filterOptions.find(
    (option) => option.id === activeFilterId
  );
  const filteredRows = activeFilter
    ? pokefutaRows.filter(activeFilter.matches)
    : pokefutaRows;
  const regionSections = buildRegionSections(filteredRows);
  const visibleRegionSections = useMemo(() => {
    const scopedSections =
      selectedRegionId !== null
        ? regionSections.filter(
            (section) => section.regionId === selectedRegionId
          )
        : [];
    if (selectedPrefectureId === null) return scopedSections;
    return scopedSections.map((section) => ({
      ...section,
      prefectureIdsToRender: section.prefectureIdsToRender.filter(
        (prefectureId) => prefectureId === selectedPrefectureId
      ),
    }));
  }, [regionSections, selectedRegionId, selectedPrefectureId]);

  type ListItem =
    | {
        type: "region";
        key: string;
        height: number;
        regionId: number;
      }
    | {
        type: "prefecture";
        key: string;
        height: number;
        regionId: number;
        prefectureId: number;
      }
    | {
        type: "row";
        key: string;
        height: number;
        row: PokefutaRow;
      }
    | {
        type: "empty";
        key: string;
        height: number;
        regionId: number;
      };

  const listItems = useMemo(() => {
    const items: ListItem[] = [];
    visibleRegionSections.forEach(
      ({
        regionId,
        rows,
        rowsByPrefectureId,
        prefectureIdsToRender,
      }) => {
        items.push({
          type: "region",
          key: `region-${regionId}`,
          height: REGION_HEADER_HEIGHT,
          regionId,
        });
        if (rows.length === 0) {
          items.push({
            type: "empty",
            key: `region-empty-${regionId}`,
            height: EMPTY_HEIGHT,
            regionId,
          });
          return;
        }
        prefectureIdsToRender.forEach((prefectureId) => {
          items.push({
            type: "prefecture",
            key: `pref-${regionId}-${prefectureId}`,
            height: PREFECTURE_HEADER_HEIGHT,
            regionId,
            prefectureId,
          });
          const prefectureRows =
            rowsByPrefectureId.get(prefectureId) ?? [];
          prefectureRows.forEach((row) => {
            items.push({
              type: "row",
              key: `row-${row.id}`,
              height: ROW_HEIGHT,
              row,
            });
          });
        });
      }
    );
    return items;
  }, [
    visibleRegionSections,
    REGION_HEADER_HEIGHT,
    PREFECTURE_HEADER_HEIGHT,
    ROW_HEIGHT,
    EMPTY_HEIGHT,
  ]);
  const listMetrics = useMemo(() => {
    let offset = 0;
    const metrics = listItems.map((item) => {
      const current = { item, offset, height: item.height };
      offset += item.height;
      return current;
    });
    return { metrics, totalHeight: offset };
  }, [listItems]);
  const [listScrollTop, setListScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
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
  useEffect(() => {
    const updateScrollMetrics = () => {
      if (listAnchorRef.current) {
        const rect =
          listAnchorRef.current.getBoundingClientRect();
        listTopOffset.current = rect.top + window.scrollY;
      }
      setViewportHeight(window.innerHeight);
      const relativeScroll = Math.max(
        0,
        window.scrollY - listTopOffset.current
      );
      setListScrollTop(relativeScroll);
    };
    updateScrollMetrics();
    window.addEventListener("resize", updateScrollMetrics);
    window.addEventListener("scroll", updateScrollMetrics);
    return () => {
      window.removeEventListener("resize", updateScrollMetrics);
      window.removeEventListener("scroll", updateScrollMetrics);
    };
  }, [selectedRegionId, selectedPrefectureId]);

  const visibleListMetrics = useMemo(() => {
    if (listMetrics.metrics.length === 0) {
      return {
        items: [] as Array<{
          item: ListItem;
          offset: number;
          height: number;
        }>,
      };
    }
    const viewStart = listScrollTop;
    const viewEnd = listScrollTop + viewportHeight;
    let low = 0;
    let high = listMetrics.metrics.length - 1;
    let startIndex = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const metric = listMetrics.metrics[mid];
      if (metric.offset + metric.height < viewStart) {
        low = mid + 1;
      } else {
        startIndex = mid;
        high = mid - 1;
      }
    }
    let endIndex = startIndex;
    while (
      endIndex < listMetrics.metrics.length &&
      listMetrics.metrics[endIndex].offset < viewEnd
    ) {
      endIndex += 1;
    }
    const overscan = 6;
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(
      listMetrics.metrics.length,
      endIndex + overscan
    );
    return { items: listMetrics.metrics.slice(start, end) };
  }, [listMetrics, listScrollTop, viewportHeight]);

  const renderListItem = useCallback(
    (item: ListItem) => {
      if (item.type === "region") {
        return (
          <div className="flex h-full items-center pb-2">
            <h3 className="font-semibold">
              {REGION_LABELS[item.regionId]}
            </h3>
          </div>
        );
      }
      if (item.type === "empty") {
        return (
          <div className="text-sm text-gray-400">
            データがありません
          </div>
        );
      }
      if (item.type === "prefecture") {
        return (
          <div className="flex h-full items-end pb-2">
            <h4 className="text-sm font-semibold text-gray-600 pft-section-title">
              {getPrefectureName(item.prefectureId)}
            </h4>
          </div>
        );
      }
      const row = item.row;
      return (
        <div
          className="flex items-center gap-4 py-4 cursor-pointer pft-row"
          onClick={() => {
            saveScrollPosition();
            router.push(`/pokefuta/${row.id}`);
          }}
        >
          <Image
            src={row.image_url || "/no-image.png"}
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).src =
                "/no-image.png")
            }
            className="w-12 h-12 rounded-full object-cover"
            alt=""
            width={48}
            height={48}
            sizes="48px"
            loading="lazy"
            decoding="async"
            placeholder="empty"
          />

          <div className="flex-1">
            <div className="text-sm font-medium">
              {row.pokemon_names}
            </div>
            <div className="text-xs text-gray-500">
              {row.city_name}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-[72px] justify-end">
            {row.owned_count > 0 && (
              <span className="text-xs font-semibold text-gray-700">
                {row.owned_count}枚
              </span>
            )}
            <span className="inline-flex w-4 justify-center">
              {Math.max(
                0,
                row.any_owned_count - row.owned_count
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
              row.difficulty_code
            )}`}
          >
            {row.difficulty_code}
          </span>
        </div>
      );
    },
    [router, saveScrollPosition]
  );

  const handleSelectionClear = useCallback(() => {
    setSelectedRegionId(null);
    setSelectedPrefectureId(null);
    setActiveRegionId(null);
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
            aria-label="フィルターを開く"
            className="h-9 w-9 rounded-lg border border-gray-200 bg-white/80 text-gray-600 shadow-sm transition hover:bg-white pft-card"
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
                  <Image
                    src={r.image_url || "/no-image.png"}
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src =
                        "/no-image.png")
                    }
                    className="w-16 h-16 rounded-xl object-cover"
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    loading="lazy"
                    decoding="async"
                    placeholder="empty"
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
                onClick={() => {
                  setSelectedRegionId(id);
                  setSelectedPrefectureId(null);
                  setActiveRegionId(id);
                  listAnchorRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
                className="px-4 py-2 rounded-full text-sm whitespace-nowrap pft-chip"
              >
                {REGION_LABELS[id]}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {selectedRegionId === null ? (
              <span>地域または都道府県を選択してください。</span>
            ) : (
              <>
                <span>
                  表示中: {REGION_LABELS[selectedRegionId]}
                  {selectedPrefectureId !== null &&
                    ` / ${getPrefectureName(selectedPrefectureId)}`}
                </span>
                <button
                  type="button"
                  onClick={handleSelectionClear}
                  className="rounded-full border border-gray-200 px-2 py-1 text-[0.65rem] text-gray-600"
                >
                  選択解除
                </button>
              </>
            )}
          </div>
        </section>

        {/* =====================
            一覧
        ===================== */}
        <section ref={listAnchorRef}>
          {selectedRegionId === null ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-gray-500">
              地域または都道府県を選択すると一覧が表示されます。
            </div>
          ) : (
            <div
              className="relative"
              style={{ height: listMetrics.totalHeight }}
            >
              {visibleListMetrics.items.map((metric) => (
                <div
                  key={metric.item.key}
                  style={{
                    position: "absolute",
                    top: metric.offset,
                    height: metric.height,
                    width: "100%",
                  }}
                >
                  {renderListItem(metric.item)}
                </div>
              ))}
            </div>
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
                      setSelectedRegionId(activeRegionId);
                      setSelectedPrefectureId(prefectureId);
                      setActiveRegionId(null);
                      setShowBackToTop(true);
                      listAnchorRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
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
        >
          <div
            className="w-full max-w-md rounded-2xl p-4 pft-modal"
            onClick={(event) => event.stopPropagation()}
          >
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
                  className="px-3 py-2 rounded-lg text-sm text-left pft-chip"
                >
                  {option.label}
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
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full text-white text-xl shadow-lg z-50 pft-primary-button"
          aria-label="ページの先頭へ戻る"
        >
          ↑
        </button>
      )}
    </>
  );
}
