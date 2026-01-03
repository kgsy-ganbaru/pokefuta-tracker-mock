"use client";

import { useRef, useState } from "react";
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
  prefecture_order: number | null;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string;
  owned_count: number;
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

const PREFECTURES_BY_REGION_ID: Record<number, string[]> = {
  1: [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
  ],
  2: [
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
  ],
  3: [
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
  ],
  4: [
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
  ],
  5: [
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
  ],
  6: [
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ],
  7: ["海外"],
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

  const getPrefectureName = (
    regionId: number,
    prefectureOrder: number | null
  ) => {
    if (!prefectureOrder) return "未設定";
    const list = PREFECTURES_BY_REGION_ID[regionId] ?? [];
    return (
      list[prefectureOrder - 1] ??
      `都道府県${prefectureOrder}`
    );
  };

  const activePrefectures = activeRegionId
    ? PREFECTURES_BY_REGION_ID[activeRegionId] ?? []
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
            const rowsByPrefecture = rows.reduce(
              (acc, row) => {
                const prefectureName = getPrefectureName(
                  row.region_id,
                  row.prefecture_order
                );
                if (!acc.has(prefectureName)) {
                  acc.set(prefectureName, []);
                }
                acc.get(prefectureName)?.push(row);
                return acc;
              },
              new Map<string, PokefutaRow[]>()
            );

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

                {Array.from(rowsByPrefecture.entries()).map(
                  ([prefectureName, prefectureRows]) => (
                    <div
                      key={`${regionId}-${prefectureName}`}
                      ref={(el) => {
                        sectionRefs.current[
                          `${regionId}-${prefectureName}`
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
                              <span title="取得済み">◓⃙⁣</span>
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
                  )
                )}
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
              {activePrefectures.map((prefecture) => (
                <button
                  key={prefecture}
                  onClick={() => {
                    sectionRefs.current[
                      `${activeRegionId}-${prefecture}`
                    ]?.scrollIntoView({ behavior: "smooth" });
                    setActiveRegionId(null);
                  }}
                  className="px-3 py-2 rounded-lg border text-sm text-left hover:bg-gray-50"
                >
                  {prefecture}
                </button>
              ))}
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
