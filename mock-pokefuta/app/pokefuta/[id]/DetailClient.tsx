// app/pokefuta/[id]/DetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Pokefuta = {
  id: number;
  address: string;
  difficulty_code: string;
  image_url: string | null;
  pokemon_names: string[];
};

type Owner = {
  nickname: string;
  count: number;
};

type Props = {
  pokefuta: Pokefuta;
  owners: Owner[];
  // 今は仮。あとで auth に差し替える
  isLoggedIn?: boolean;
};

export default function DetailClient({
  pokefuta,
  owners,
  isLoggedIn = false, // ← デフォルトはゲスト
}: Props) {
  const router = useRouter();

  // ゲストでも触れる枚数
  const [count, setCount] = useState(0);

  const handleUpdate = () => {
    if (!isLoggedIn) {
      alert("ポケふたを登録するにはログインが必要です！");
      return;
    }

    // TODO: ここに DB 更新処理を入れる
    alert("更新しました（仮）");
    router.push("/");
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-6">
      {/* 一覧へ戻る */}
      <button
        onClick={() => router.push("/")}
        className="text-sm text-blue-600 mb-4"
      >
        ← 一覧へ戻る
      </button>

      {/* 基本情報 */}
      <section className="bg-white border rounded-xl p-5 mb-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={pokefuta.image_url ?? "/no-image.png"}
            alt="ポケふた"
            className="w-48 h-48 object-cover rounded-lg"
          />

          <h1 className="text-lg font-semibold">
            {pokefuta.pokemon_names.join(" / ")}
          </h1>

          <p className="text-sm text-gray-600">
            {pokefuta.address}
          </p>

          <span className="text-sm font-semibold">
            難易度：{pokefuta.difficulty_code}
          </span>
        </div>
      </section>

      {/* 更新UI */}
      <section className="bg-white border rounded-xl p-5 mb-6">
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
            onClick={handleUpdate}
            className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold"
          >
            更新する
          </button>
        </div>

        {!isLoggedIn && (
          <p className="mt-3 text-sm text-center text-gray-500">
            ※ 登録・更新にはログインが必要です
          </p>
        )}
      </section>

      {/* 所持ユーザ一覧 */}
      <section>
        <h2 className="text-md font-semibold mb-2">
          所持ユーザ
        </h2>

        {owners.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ誰も取得していません
          </p>
        ) : (
          <ul className="divide-y">
            {owners.map((o) => (
              <li
                key={o.nickname}
                className="flex justify-between py-2 text-sm"
              >
                <span>{o.nickname}</span>
                <span>{o.count} 枚</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
