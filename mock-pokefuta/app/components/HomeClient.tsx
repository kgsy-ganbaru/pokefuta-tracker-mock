"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getRankClass } from "../utils/rankColor";

/* =====================
   型定義
===================== */
type RecentRow = {
  id: number;
  address: string;
  image_url: string | null;
  pokemon_names: string;
  user_names: string;
};

type PokefutaRow = {
  id: number;
  region_id: number;
  prefecture_id: number | null;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string;
  owned_count: number;
  any_owned_count: number;
};

/* =====================
   地域定数
===================== */
const REGION_LABELS: Record<number, string> = {
  1: "北海道・東北",
  2: "関東",
  3: "中部",
  4: "近畿",
  5: "中国・四国",
  6: "九州・沖縄",
  7: "その他",
};

const REGION_ORDER = Object.keys(REGION_LABELS).map(Number);

const PREFECTURE_LABELS: Record<number, string> = {
  1: "北海道",
  2: "青森県",
  3: "岩手県",
  4: "宮城県",
  5: "秋田県",
  6: "山形県",
  7: "福島県",
  8: "茨城県",
  9: "栃木県",
  10: "群馬県",
  11: "埼玉県",
  12: "千葉県",
  13: "東京都",
  14: "神奈川県",
  15: "新潟県",
  16: "富山県",
  17: "石川県",
  18: "福井県",
  19: "山梨県",
  20: "長野県",
  21: "岐阜県",
  22: "静岡県",
  23: "愛知県",
  24: "三重県",
  25: "滋賀県",
  26: "京都府",
  27: "大阪府",
  28: "兵庫県",
  29: "奈良県",
  30: "和歌山県",
  31: "鳥取県",
  32: "島根県",
  33: "岡山県",
  34: "広島県",
  35: "山口県",
  36: "徳島県",
  37: "香川県",
  38: "愛媛県",
  39: "高知県",
  40: "福岡県",
  41: "佐賀県",
  42: "長崎県",
  43: "熊本県",
  44: "大分県",
  45: "宮崎県",
  46: "鹿児島県",
  47: "沖縄県",
};

const PREFECTURE_IDS_BY_REGION_ID: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6, 7],
  2: [8, 9, 10, 11, 12, 13, 14],
  3: [15, 16, 17, 18, 19, 20, 21, 22, 23],
  4: [24, 25, 26, 27, 28, 29, 30],
  5: [31, 32, 33, 34, 35, 36, 37, 38, 39],
  6: [40, 41, 42, 43, 44, 45, 46, 47],
  7: [],
};

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

  const [activeRegionId, setActiveRegionId] = useState<
    number | null
  >(null);
  const sectionRefs = useRef<
    Record<string, HTMLDivElement | null>
  >({});

  const getPrefectureName = (prefectureId: number | null) => {
    if (!prefectureId) return "未設定";
    return (
      PREFECTURE_LABELS[prefectureId] ??
      `都道府県${prefectureId}`
    );
  };

  const activePrefectureIds =
    activeRegionId !== null
      ? PREFECTURE_IDS_BY_REGION_ID[activeRegionId] ?? []
      : [];

  return (
    <>
      <main
        id="scroll-root"
        className="max-w-3xl mx-auto px-4 pb-24"
      >
        {/* =====================
            最近ゲット
        ===================== */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">
            最近ゲット
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentRows.map((r) => (
              <div
                key={r.id}
                className="min-w-[220px] border rounded-xl p-4 bg-white"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <img
                    src={r.image_url || "/no-image.png"}
                    onError={(e) =>
                      ((e.currentTarget as HTMLImageElement).src =
                        "/no-image.png")
                    }
                    className="w-20 h-20 rounded-xl object-cover"
                    alt=""
                  />

                  <div className="font-medium">
                    {r.pokemon_names}
                  </div>

                  <div className="text-xs text-gray-500">
                    {r.address}
                  </div>

                  <div className="text-xs text-gray-600">
                    {r.user_names}
                  </div>
                </div>
              </div>
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
                className="px-4 py-2 rounded-full border text-sm whitespace-nowrap"
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
          {REGION_ORDER.map((regionId) => {
            const rows = pokefutaRows.filter(
              (p) => p.region_id === regionId
            );
            const rowsByPrefectureId = rows.reduce(
              (acc, row) => {
                const prefectureId = row.prefecture_id ?? 0;
                if (!acc.has(prefectureId)) {
                  acc.set(prefectureId, []);
                }
                acc.get(prefectureId)?.push(row);
                return acc;
              },
              new Map<number, PokefutaRow[]>()
            );
            const orderedPrefectureIds =
              PREFECTURE_IDS_BY_REGION_ID[regionId] ?? [];
            const extraPrefectureIds = Array.from(
              rowsByPrefectureId.keys()
            )
              .filter((id) => !orderedPrefectureIds.includes(id))
              .sort((a, b) => a - b);
            const prefectureIdsToRender = [
              ...orderedPrefectureIds,
              ...extraPrefectureIds,
            ].filter((id) => rowsByPrefectureId.has(id));

            return (
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
                      <h4 className="text-sm font-semibold text-gray-600 mb-2">
                        {prefectureName}
                      </h4>
                      {prefectureRows.map((p) => (
                        <div
                          key={p.id}
                          onClick={() =>
                            router.push(`/pokefuta/${p.id}`)
                          }
                          className="flex items-center gap-4 py-4 border-b cursor-pointer hover:bg-gray-50"
                        >
                          <img
                            src={p.image_url || "/no-image.png"}
                            onError={(e) =>
                              ((e.currentTarget as HTMLImageElement).src =
                                "/no-image.png")
                            }
                            className="w-14 h-14 rounded-full object-cover"
                            alt=""
                          />

                          <div className="flex-1">
                            <div className="font-medium">
                              {p.pokemon_names}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.address}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.owned_count > 0 && (
                              <Image
                                src="/status-owned.svg"
                                alt="取得済み"
                                title="取得済み"
                                width={16}
                                height={16}
                              />
                            )}
                            {p.any_owned_count > 0 && (
                              <Image
                                src="/status-any-owned.svg"
                                alt="誰かが取得済み"
                                title="誰かが取得済み"
                                width={16}
                                height={16}
                              />
                            )}
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
            );
          })}
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

      {/* =====================
          トップへ戻る
      ===================== */}
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 text-white text-xl shadow-lg z-50"
        aria-label="ページの先頭へ戻る"
      >
        ↑
      </button>
    </>
  );
}
