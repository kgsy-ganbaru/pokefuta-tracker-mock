"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { pokefutaList } from "@/app/data/pokefuta";
import { ownershipMap } from "@/app/data/ownership";
import { getRankClass } from "@/app/utils/rankColor";

export default function PokefutaDetailPage() {
  const params = useParams();
  const router = useRouter();

  /* =====================
     スクロール対象（重要）
  ===================== */
  const mainRef = useRef<HTMLElement | null>(null);

  /* =====================
     対象ポケふた取得
  ===================== */
  const id = Number(params.id);
  const pokefuta = pokefutaList.find((p) => p.id === id);

  if (!pokefuta) {
    return (
      <main className="p-4">
        <p>該当するポケふたが見つかりません。</p>
      </main>
    );
  }

  /* =====================
     所持データ（モック）
  ===================== */
  const owners = ownershipMap[id] ?? [];
  const currentUser = "seiya";

  const myOwnership = owners.find(
    (o) => o.user === currentUser
  );

  const [count, setCount] = useState(
    myOwnership?.count ?? 0
  );

  /* =====================
     トップへ戻るボタン制御
  ===================== */
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const onScroll = () => {
      setShowTopButton(el.scrollTop > 300);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main
      ref={mainRef}
      className="
        max-w-3xl mx-auto
        px-4 py-6 pb-24
        h-[calc(100vh-64px)]
        overflow-y-auto
      "
    >
      {/* =====================
          一覧へ戻る
      ===================== */}
      <button
        onClick={() => router.push("/")}
        className="text-sm text-blue-600 mb-4"
      >
        ← 一覧へ戻る
      </button>

      {/* =====================
          ポケふた基本情報
      ===================== */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            No Image
          </div>

          <div className="text-lg font-medium text-gray-800">
            {pokefuta.pokemonNames.join(" / ")}
          </div>

          <div className="text-sm text-gray-500">
            {pokefuta.address}
          </div>

          <div className="text-sm text-gray-600">
            {pokefuta.region} / {pokefuta.prefecture}
          </div>

          <span
            className={`px-3 py-1 rounded-md text-sm font-semibold ${getRankClass(
              pokefuta.difficulty
            )}`}
          >
            難易度 {pokefuta.difficulty}
          </span>
        </div>
      </section>

      {/* =====================
          更新UI
      ===================== */}
      <section className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h2 className="text-md font-semibold text-gray-800 mb-4 text-center">
          あなたの所持枚数
        </h2>

        <div className="flex items-center justify-center gap-8 mb-6">
          <button
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="
              w-12 h-12 rounded-full
              border border-gray-300
              text-2xl
              hover:bg-gray-100
              active:scale-95
              transition
            "
          >
            −
          </button>

          <div className="text-2xl font-semibold">
            {count} 枚
          </div>

          <button
            onClick={() => setCount((c) => c + 1)}
            className="
              w-12 h-12 rounded-full
              border border-gray-300
              text-2xl
              hover:bg-gray-100
              active:scale-95
              transition
            "
          >
            ＋
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              if (confirm("更新しますか？")) {
                alert("更新しました（モック）");
                router.push("/");
              }
            }}
            className="
              px-8 py-3
              rounded-full
              bg-blue-600
              text-white
              font-semibold
              shadow-sm
              hover:bg-blue-700
              active:scale-95
              transition
            "
          >
            更新する
          </button>
        </div>
      </section>

      {/* =====================
          所持者一覧
      ===================== */}
      <section>
        <h2 className="text-md font-semibold text-gray-800 mb-2">
          所持者一覧
        </h2>

        {owners.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ誰も取得していません。
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {owners.map((o) => (
              <li
                key={o.user}
                className="flex justify-between py-2 text-sm"
              >
                <span>{o.user}</span>
                <span>{o.count} 枚</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* =====================
          トップへ戻るボタン
      ===================== */}
      {showTopButton && (
        <button
          onClick={() =>
            mainRef.current?.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="
            fixed bottom-6 right-6
            w-12 h-12 rounded-full
            bg-blue-600 text-white
            text-xl font-bold
            shadow-lg
            hover:bg-blue-700
            active:scale-95
            transition
          "
          aria-label="トップへ戻る"
        >
          ↑
        </button>
      )}
    </main>
  );
}
