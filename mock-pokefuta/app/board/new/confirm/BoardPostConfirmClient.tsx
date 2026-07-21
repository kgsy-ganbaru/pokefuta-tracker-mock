"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBoardPostAction } from "../../../actions/board";
import { BOARD_DRAFT_KEY, BOARD_DRAFT_RESUME_KEY, BoardPostDraft } from "../BoardPostFormClient";
import LoadingOverlay from "../../../components/LoadingOverlay";

export default function BoardPostConfirmClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<BoardPostDraft | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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

  const rowsById = useMemo(() => new Map((draft?.rows ?? []).map((row) => [row.id, row])), [draft]);
  const renderSelections = (ids: number[]) => (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {ids.map((id) => {
        const row = rowsById.get(id);
        if (!row) return null;
        return <div key={id} className="rounded-xl border bg-white p-2 text-center shadow-sm"><img src={row.image_url || "/no-image.png"} alt="" className="aspect-square w-full rounded-full object-cover" /><p className="mt-2 truncate text-xs font-semibold text-gray-700">{row.city_name}</p><p className="truncate text-[10px] text-gray-500">{row.pokemon_names}</p></div>;
      })}
    </div>
  );

  const handleSubmit = () => {
    if (!draft) return;
    setError("");
    startTransition(async () => {
      const result = await createBoardPostAction({ offers: draft.offers, wants: draft.wants, comment: draft.comment });
      if ("error" in result) {
        setError(result.error ?? "投稿に失敗しました。");
        return;
      }
      window.localStorage.removeItem(BOARD_DRAFT_KEY);
      window.sessionStorage.removeItem(BOARD_DRAFT_RESUME_KEY);
      router.push(`/board/${result.postId}`);
    });
  };

  if (!draft) return <main className="mx-auto max-w-3xl p-6 text-center"><p className="text-sm text-gray-500">確認する入力内容がありません。</p><button type="button" onClick={() => router.push("/board/new")} className="mt-4 rounded-full border px-5 py-2 text-sm font-semibold">入力画面へ戻る</button></main>;

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-24">
      <header><h1 className="text-xl font-semibold text-gray-800">投稿内容の確認</h1><p className="mt-2 text-sm text-gray-500">この内容で投稿しますか？ 投稿は7日後に自動で募集終了になります。</p></header>
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-emerald-700">出</h2><span className="text-sm text-gray-500">{draft.offers.length}種類</span></div>{renderSelections(draft.offers)}</section>
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-amber-700">求</h2><span className="text-sm text-gray-500">{draft.wants.length}種類</span></div>{renderSelections(draft.wants)}</section>
      <section className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold text-gray-800">任意コメント</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{draft.comment || "コメントはありません。"}</p></section>
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center"><button type="button" disabled={isPending} onClick={() => { window.sessionStorage.setItem(BOARD_DRAFT_RESUME_KEY, "true"); router.push("/board/new"); }} className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50">入力内容を修正する</button><button type="button" disabled={isPending} onClick={handleSubmit} className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">この内容で投稿する</button></div>
      {isPending && <LoadingOverlay />}
    </main>
  );
}
