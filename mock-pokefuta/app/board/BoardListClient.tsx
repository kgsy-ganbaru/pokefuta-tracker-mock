"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ImageWithFallback from "../components/ImageWithFallback";
import { BoardItem, BoardThread, remainingDays } from "./mockThreads";

const PREVIEW_ITEM_LIMIT = 4;

export type BoardThreadWithMatch = BoardThread & {
  exchangePossible: boolean;
};

function ItemPreview({ items, tone }: { items: BoardItem[]; tone: "offer" | "want" }) {
  const hiddenCount = Math.max(0, items.length - PREVIEW_ITEM_LIMIT);
  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {items.slice(0, PREVIEW_ITEM_LIMIT).map((item) => (
          <div key={item.id} className={`rounded-xl border p-1.5 text-center ${tone === "offer" ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
            <div className="relative mx-auto aspect-square w-full max-w-16">
              <ImageWithFallback src={item.image} alt="" className="h-full w-full object-contain p-1" />
            </div>
            <p className="mt-2 truncate text-[11px] font-semibold text-gray-700">{item.city}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-right text-xs font-semibold text-gray-500">{hiddenCount > 0 ? `ほか${hiddenCount}種類` : `${items.length}種類`}</p>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mx-auto h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8z" />
    </svg>
  );
}

export default function BoardListClient({ threads, isLoggedIn }: { threads: BoardThreadWithMatch[]; isLoggedIn: boolean }) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [matchOnly, setMatchOnly] = useState(false);
  const visibleThreads = useMemo(() => matchOnly ? threads.filter((thread) => thread.exchangePossible) : threads, [matchOnly, threads]);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/board/mine" className="text-sm font-semibold text-emerald-700">自分の投稿を確認</Link>
        <button
          type="button"
          onClick={() => setShowFilterModal(true)}
          aria-label={matchOnly ? "フィルターを開く。現在：交換可能な投稿" : "フィルターを開く"}
          className="relative h-11 w-11 rounded-lg border border-gray-200 bg-white/80 text-gray-600 shadow-sm transition hover:bg-white pft-card"
        >
          <FilterIcon />
          {matchOnly && <span aria-hidden="true" className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />}
        </button>
      </div>

      {matchOnly && (
        <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <span className="truncate">絞り込み中：交換可能な投稿</span>
          <button type="button" onClick={() => setMatchOnly(false)} className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">解除</button>
        </div>
      )}

      {visibleThreads.length === 0 ? (
        <section className="rounded-2xl border border-dashed bg-white p-8 text-center">
          <p className="font-semibold text-gray-700">{matchOnly ? "交換可能な投稿はありません。" : "現在、募集中の投稿はありません。"}</p>
          <p className="mt-2 text-sm text-gray-500">{matchOnly ? "所持状況を更新すると、新しい交換候補が見つかることがあります。" : "最初の交換募集を投稿してみましょう。"}</p>
        </section>
      ) : (
        <section aria-label="投稿一覧" className="space-y-4">
          {visibleThreads.map((thread) => {
            const days = remainingDays(thread);
            return (
              <article key={thread.id} className={`overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md ${thread.exchangePossible ? "border-emerald-400 bg-emerald-50/40 ring-1 ring-emerald-200" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{thread.user.nickname.slice(0, 1)}</div>
                    <div className="min-w-0">
                      <Link href={`/users/${thread.user.id}`} className="block truncate text-sm font-semibold text-emerald-700 hover:underline">{thread.user.nickname}</Link>
                      <p className="text-[11px] text-gray-500">更新日：{thread.updatedAt}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {thread.exchangePossible && <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">交換可能！</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${days <= 1 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{days <= 1 ? "まもなく終了" : "募集中"}・あと{days}日</span>
                  </div>
                </div>
                <Link href={`/board/${thread.id}`} className="block space-y-5 p-4">
                  <section className="space-y-2"><h2 className="text-sm font-bold text-emerald-700">出</h2><ItemPreview items={thread.offers} tone="offer" /></section>
                  <section className="space-y-2"><h2 className="text-sm font-bold text-amber-700">求</h2><ItemPreview items={thread.wants} tone="want" /></section>
                  <p className="line-clamp-2 text-sm leading-6 text-gray-600">{thread.comment}</p>
                  <div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500"><span className="font-medium text-emerald-700">投稿の詳細を見る →</span><span>コメント {thread.comments.length}件</span></div>
                </Link>
              </article>
            );
          })}
        </section>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24" onClick={() => setShowFilterModal(false)} role="dialog" aria-modal="true" aria-labelledby="board-filter-title">
          <div className="w-full max-w-md rounded-2xl p-4 pft-modal" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="board-filter-title" className="text-sm font-semibold">表示を絞り込む</h2>
              <button type="button" onClick={() => setShowFilterModal(false)} aria-label="閉じる" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-600">×</button>
            </div>
            <button
              type="button"
              disabled={!isLoggedIn}
              onClick={() => { setMatchOnly((current) => !current); setShowFilterModal(false); }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm pft-chip disabled:cursor-not-allowed disabled:opacity-50 ${matchOnly ? "ring-2 ring-emerald-400" : ""}`}
            >
              <span className="inline-flex w-8 shrink-0 justify-center text-emerald-700"><FilterIcon /></span>
              <span>交換可能な投稿</span>
            </button>
            {!isLoggedIn && <p className="mt-3 text-xs leading-5 text-gray-500">交換可能な投稿を判定するにはログインが必要です。</p>}
          </div>
        </div>
      )}
    </>
  );
}
