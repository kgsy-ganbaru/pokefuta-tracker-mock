"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BOARD_DRAFT_KEY, BoardPostDraft } from "../BoardPostFormClient";

export default function BoardPostConfirmClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<BoardPostDraft | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(BOARD_DRAFT_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as BoardPostDraft;
      const frame = window.requestAnimationFrame(() => setDraft(parsed));
      return () => window.cancelAnimationFrame(frame);
    } catch {
      window.localStorage.removeItem(BOARD_DRAFT_KEY);
    }
  }, []);

  const rowsById = useMemo(
    () => new Map((draft?.rows ?? []).map((row) => [row.id, row])),
    [draft]
  );

  const renderSelections = (quantities: Record<number, number>) => (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {Object.entries(quantities).map(([id, count]) => {
        const row = rowsById.get(Number(id));
        if (!row) return null;
        return (
          <div key={id} className="rounded-xl border bg-white p-2 text-center shadow-sm">
            <img src={row.image_url || "/no-image.png"} alt="" className="aspect-square w-full rounded-full object-cover" />
            <p className="mt-2 truncate text-xs font-semibold text-gray-700">{row.city_name}</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">{count}枚</p>
          </div>
        );
      })}
    </div>
  );

  if (!draft) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-center">
        <p className="text-sm text-gray-500">確認する入力内容がありません。</p>
        <button type="button" onClick={() => router.push("/board/new")} className="mt-4 rounded-full border px-5 py-2 text-sm font-semibold">入力画面へ戻る</button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-24">
      <header>
        <h2 className="text-xl font-semibold text-gray-800">投稿内容の確認</h2>
        <p className="mt-2 text-sm text-gray-500">この内容で投稿しますか？</p>
      </header>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">投稿者</p>
        <button type="button" onClick={() => router.push(`/users/${draft.poster.userId}`)} className="mt-1 font-semibold text-emerald-700 underline underline-offset-2">
          {draft.poster.nickname}
        </button>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800">出せるポケふた</h3>
        {renderSelections(draft.offers)}
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800">欲しいポケふた</h3>
        {renderSelections(draft.wants)}
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800">任意コメント</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{draft.comment || "コメントはありません。"}</p>
      </section>

      {submitted && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          投稿を受け付けました。現在はモックのため、データは保存されません。
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
        <button type="button" onClick={() => router.push("/board/new")} className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-700">入力内容を修正する</button>
        <button type="button" onClick={() => setSubmitted(true)} className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600">この内容で投稿する</button>
      </div>
    </main>
  );
}
