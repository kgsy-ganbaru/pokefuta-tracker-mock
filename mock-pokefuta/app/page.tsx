"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

import { pokefutaList } from "./data/pokefuta";
import { ownershipMap } from "./data/ownership";
import { recentGets } from "./data/recent";
import { getRankClass } from "./utils/rankColor";

export default function HomePage() {
  const router = useRouter();

  /* =====================
     地域定義（順番が重要）
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
     地域スクロール用 ref
  ===================== */
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  return (
    <>
      {/* =====================
          メインコンテンツ
          ※ id が重要
      ===================== */}
      <main
        id="scroll-root"
        className="max-w-3xl mx-auto px-4 pb-24"
      >
        {/* =====================
            最近ゲット
        ===================== */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            最近ゲット
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentGets.map((item) => {
              const owners = ownershipMap[item.id] ?? [];

              return (
                <div
                  key={item.id}
                  className="min-w-[220px] bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                      No Image
                    </div>

                    <div className="font-medium text-gray-800">
                      {item.pokemonNames.join(" / ")}
                    </div>

                    <div className="text-xs text-gray-500">
                      {item.address}
                    </div>

                    <div className="flex gap-2 flex-wrap justify-center text-xs mt-1">
                      {owners.length === 0 ? (
                        <span className="text-gray-400">
                          未取得
                        </span>
                      ) : (
                        owners.map((o) => (
                          <span
                            key={o.user}
                            className="bg-gray-100 rounded-full px-2 py-1"
                          >
                            {o.user} {o.count}枚
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================
            地域ナビ（最近ゲットの直下）
        ===================== */}
        <section className="mt-8 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() =>
                  sectionRefs.current[region]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="
                  px-4 py-2 rounded-full border
                  text-sm whitespace-nowrap
                  bg-white border-gray-300
                  hover:bg-gray-100
                "
              >
                {region}
              </button>
            ))}
          </div>
        </section>

        {/* =====================
            一覧（全件）
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
                className="mb-12 scroll-mt-4"
              >
                <h3 className="text-md font-semibold text-gray-700 mb-3">
                  {region}
                </h3>

                <div className="divide-y divide-gray-200">
                  {items.map((p) => {
                    const owners =
                      ownershipMap[p.id] ?? [];

                    return (
                      <div
                        key={p.id}
                        onClick={() =>
                          router.push(`/pokefuta/${p.id}`)
                        }
                        className="
                          flex items-center gap-4 py-4
                          cursor-pointer
                          transition
                          hover:bg-gray-50
                          active:bg-gray-100
                        "
                      >
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs shrink-0">
                          No Image
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-gray-800">
                            {p.pokemonNames.join(" / ")}
                          </div>

                          <div className="text-xs text-gray-500">
                            {p.address}
                          </div>

                          <div className="flex gap-2 flex-wrap text-xs mt-1">
                            {owners.length === 0 ? (
                              <span className="text-gray-400">
                                （未取得）
                              </span>
                            ) : (
                              owners.map((o) => (
                                <span
                                  key={o.user}
                                  className="bg-gray-100 rounded-full px-2 py-0.5"
                                >
                                  {o.user} {o.count}枚
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getRankClass(
                            p.difficulty
                          )}`}
                        >
                          {p.difficulty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* =====================
          ページ最上部へ戻る（右下・常時表示）
      ===================== */}
      <button
        onClick={() => {
          const el =
            document.getElementById("scroll-root");

          if (el && el.scrollTop > 0) {
            el.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          } else {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }}
        className="
          fixed bottom-6 right-6
          w-12 h-12 rounded-full
          bg-blue-600 text-white
          text-xl font-bold
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
