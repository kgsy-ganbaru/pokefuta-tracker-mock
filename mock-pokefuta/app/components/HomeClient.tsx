"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { pokefutaList } from "../data/pokefuta";
import { ownershipMap } from "../data/ownership";
import { recentGets } from "../data/recent";
import { getRankClass } from "../utils/rankColor";

export default function HomeClient() {
  const router = useRouter();

  /* =====================
     地域定義
  ===================== */
  const regions = [
    "北海道・東北",
    "関東",
    "中部",
    "近畿",
    "中国・四国",
    "九州・沖縄",
    "その他",
  ];

  /* =====================
     スクロール用 ref
  ===================== */
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
            {recentGets.map((item) => {
              const owners = ownershipMap[item.id] ?? [];

              return (
                <div
                  key={item.id}
                  className="min-w-[220px] bg-white rounded-xl border p-4"
                >
                  <div className="text-center">
                    <div className="font-medium">
                      {item.pokemonNames.join(" / ")}
                    </div>

                    <div className="text-xs text-gray-500">
                      {item.address}
                    </div>

                    <div className="text-xs mt-2">
                      {owners.length === 0
                        ? "未取得"
                        : owners.map((o) => (
                            <span
                              key={o.user}
                              className="inline-block mr-2"
                            >
                              {o.user} {o.count}枚
                            </span>
                          ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================
            地域ナビ
        ===================== */}
        <section className="mt-8 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() =>
                  sectionRefs.current[region]?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
                className="px-4 py-2 rounded-full border text-sm whitespace-nowrap"
              >
                {region}
              </button>
            ))}
          </div>
        </section>

        {/* =====================
            一覧
        ===================== */}
        <section>
          {regions.map((region) => {
            const items = pokefutaList.filter(
              (p) => p.region === region
            );
            if (items.length === 0) return null;

            return (
              <div
                key={region}
                ref={(el) => {
                  sectionRefs.current[region] = el;
                }}
                className="mb-12"
              >
                <h3 className="font-semibold mb-3">
                  {region}
                </h3>

                {items.map((p) => (
                  <div
                    key={p.id}
                    onClick={() =>
                      router.push(`/pokefuta/${p.id}`)
                    }
                    className="py-4 border-b cursor-pointer hover:bg-gray-50"
                  >
                    <div className="font-medium">
                      {p.pokemonNames.join(" / ")}
                    </div>

                    <div className="text-xs text-gray-500">
                      {p.address}
                    </div>

                    <span
                      className={`text-xs ${getRankClass(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
      </main>

      {/* =====================
          トップへ戻る（常時表示）
      ===================== */}
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="
          fixed bottom-6 right-6
          w-12 h-12
          rounded-full
          bg-blue-600
          text-white
          text-xl
          shadow-lg
          hover:bg-blue-700
          active:scale-95
          transition
          z-50
        "
        aria-label="ページの先頭へ戻る"
      >
        ↑
      </button>
    </>
  );
}
