"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateOwnershipAction } from "@/app/actions/ownership";

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
  isLoggedIn: boolean;
  initialCount: number;
};

function SubmitButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type={isLoggedIn ? "submit" : "button"}
      className="px-8 py-3 rounded-full bg-blue-600 text-white font-semibold disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "更新中..." : "更新する"}
    </button>
  );
}

export default function DetailClient({
  pokefuta,
  owners,
  isLoggedIn,
  initialCount,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [guestWarning, setGuestWarning] = useState(false);
  const [state, formAction] = useFormState(updateOwnershipAction, {
    error: "",
    success: false,
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 pb-16">
      {/* 基本情報 */}
      <section className="bg-white border rounded-xl p-5 mb-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={pokefuta.image_url ?? "/no-image.png"}
            alt="ポケふた"
            className="w-34 h-34 object-cover rounded-lg"
          />

          <h1 className="text-base font-semibold">
            {pokefuta.pokemon_names.join(" / ")}
          </h1>

          <p className="text-sm text-gray-600">{pokefuta.address}</p>

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

          <div className="text-2xl font-semibold">{count} 枚</div>

          <button
            onClick={() => setCount((c) => c + 1)}
            className="w-12 h-12 rounded-full border text-2xl"
          >
            ＋
          </button>
        </div>

        <form
          action={formAction}
          className="flex flex-col items-center gap-3"
          onSubmit={(event) => {
            if (!isLoggedIn) {
              event.preventDefault();
              setGuestWarning(true);
            }
          }}
        >
          <input type="hidden" name="pokefutaId" value={pokefuta.id} />
          <input type="hidden" name="count" value={count} />

          <SubmitButton isLoggedIn={isLoggedIn} />

          {state.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}
          {state.success && (
            <p className="text-sm text-green-600">更新しました</p>
          )}
          {guestWarning && (
            <p className="text-sm text-center text-gray-500">
              ポケふたを登録するにはログインが必要です
            </p>
          )}
        </form>
      </section>

      {/* 所持ユーザ一覧 */}
      <section className="bg-white border rounded-xl p-5">
        <h2 className="text-md font-semibold mb-2">所持ユーザ</h2>

        {owners.length === 0 ? (
          <p className="text-sm text-gray-500">まだ誰も取得していません</p>
        ) : (
          <div className="max-h-64 overflow-y-auto pr-2">
            <ul className="divide-y">
              {owners.map((o, index) => (
                <li
                  key={`${o.nickname}-${o.count}-${index}`}
                  className="flex justify-between py-2 text-sm"
                >
                  <span>{o.nickname}</span>
                  <span>{o.count} 枚</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/"
          className="w-48 rounded-full border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          一覧に戻る
        </Link>
      </div>
    </main>
  );
}
