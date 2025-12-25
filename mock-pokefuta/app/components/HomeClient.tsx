"use client";

import { useRef } from "react";
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
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string;
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

  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>(
    {}
  );

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
                onClick={() =>
                  sectionRefs.current[id]?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
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

            return (
              <div
                key={regionId}
                ref={(el) => {
                  sectionRefs.current[regionId] = el;
                }}
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

                {rows.map((p) => (
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
            );
          })}
        </section>
      </main>

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
