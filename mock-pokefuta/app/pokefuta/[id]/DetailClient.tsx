// app/pokefuta/[id]/DetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  pokefuta: {
    id: number;
    address: string;
    difficulty: string;
  };
};

export default function DetailClient({ pokefuta }: Props) {
  const router = useRouter();

  // モック用（あとでDB更新に差し替える）
  const [count, setCount] = useState(0);

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* 一覧へ戻る */}
      <button
        onClick={() => router.push("/")}
        className="text-sm text-blue-600 mb-4"
      >
        ← 一覧へ戻る
      </button>

      {/* ポケふた情報 */}
      <section className="bg-white border rounded-xl p-5 mb-6">
        <h1 className="text-lg font-semibold mb-2">
          ポケふた ID: {pokefuta.id}
        </h1>

        <p className="text-sm text-gray-600 mb-1">
          住所：{pokefuta.address}
        </p>

        <p className="text-sm text-gray-600">
          難易度：{pokefuta.difficulty}
        </p>
      </section>

      {/* 更新UI */}
      <section className="bg-white border rounded-xl p-5">
        <h2 className="text-md font-semibold mb-4 text-center">
          あなたの所持枚数
        </h2>

        <div className="flex items-center justify-center gap-8 mb-6">
          <button
            onClick={() => setCount((c) => Math.max(0, c - 1))}
            className="w-12 h-12 rounded-full border text-2xl"
          >
            −
          </button>

          <div className="text-2xl font-semibold">
            {count} 枚
          </div>

          <button
            onClick={() => setCount((c) => c + 1)}
            className="w-12 h-12 rounded-full border text-2xl"
          >
            ＋
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              if (confirm("更新しますか？（モック）")) {
                alert("更新しました（まだDB未接続）");
                router.push("/");
              }
            }}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold"
          >
            更新する
          </button>
        </div>
      </section>
    </main>
  );
}
