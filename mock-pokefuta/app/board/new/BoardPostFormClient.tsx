"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PokefutaRow } from "../../lib/pokefuta/listData";
import PokefutaQuantitySelector, { QuantityMap } from "./PokefutaQuantitySelector";

export const BOARD_DRAFT_KEY = "boardPostDraft";
export const BOARD_MAX_TOTAL = 30;
export const BOARD_COMMENT_MAX = 200;

export type BoardPostDraft = {
  poster: { userId: string; nickname: string };
  offers: QuantityMap;
  wants: QuantityMap;
  comment: string;
  rows: PokefutaRow[];
};

export default function BoardPostFormClient({
  pokefutaRows,
  poster,
  isDemo,
}: {
  pokefutaRows: PokefutaRow[];
  poster: { user_id: string; nickname: string };
  isDemo: boolean;
}) {
  const router = useRouter();
  const [offers, setOffers] = useState<QuantityMap>({});
  const [wants, setWants] = useState<QuantityMap>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(BOARD_DRAFT_KEY);
    if (!stored) return;
    try {
      const draft = JSON.parse(stored) as BoardPostDraft;
      const frame = window.requestAnimationFrame(() => {
        setOffers(draft.offers ?? {});
        setWants(draft.wants ?? {});
        setComment(draft.comment ?? "");
      });
      return () => window.cancelAnimationFrame(frame);
    } catch {
      window.localStorage.removeItem(BOARD_DRAFT_KEY);
    }
  }, []);

  const offerTotal = useMemo(
    () => Object.values(offers).reduce((sum, value) => sum + value, 0),
    [offers]
  );
  const wantTotal = useMemo(
    () => Object.values(wants).reduce((sum, value) => sum + value, 0),
    [wants]
  );
  const hasDraft = offerTotal > 0 || wantTotal > 0 || comment.length > 0;

  const visitProfile = () => {
    if (
      hasDraft &&
      !window.confirm(
        "ユーザー画面に移動すると、現在の入力内容が破棄されます。移動してもよろしいですか？"
      )
    ) {
      return;
    }
    window.localStorage.removeItem(BOARD_DRAFT_KEY);
    router.push(`/users/${poster.user_id}`);
  };

  const handleConfirm = () => {
    if (offerTotal === 0 || wantTotal === 0) {
      setError("出せるポケふたと欲しいポケふたを、それぞれ1枚以上選択してください。");
      return;
    }
    const selectedIds = new Set([
      ...Object.keys(offers).map(Number),
      ...Object.keys(wants).map(Number),
    ]);
    const draft: BoardPostDraft = {
      poster: { userId: poster.user_id, nickname: poster.nickname },
      offers,
      wants,
      comment,
      rows: pokefutaRows.filter((row) => selectedIds.has(row.id)),
    };
    window.localStorage.setItem(BOARD_DRAFT_KEY, JSON.stringify(draft));
    router.push("/board/new/confirm");
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28">
      <header className="space-y-2">
        <Link href="/board" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
          <span aria-hidden="true">←</span>掲示板に戻る
        </Link>
        <h2 className="text-xl font-semibold text-gray-800">新しい投稿を作成</h2>
        <p className="text-sm text-gray-500">画像を選び、＋／−ボタンで交換枚数を設定してください。</p>
      </header>

      <section className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">投稿者</p>
          <p className="font-semibold text-gray-800">{poster.nickname}</p>
          {isDemo && <p className="mt-1 text-xs text-amber-700">未ログイン時のモック表示です</p>}
        </div>
        <button type="button" onClick={visitProfile} className="rounded-full border px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-gray-50">
          ユーザーを見る
        </button>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-800">出せるポケふた</h3>
          <p className="mt-1 text-sm text-gray-500">所持しているポケふたから、合計30枚まで選択できます。</p>
        </div>
        <PokefutaQuantitySelector rows={pokefutaRows} quantities={offers} onChange={(next) => { setOffers(next); setError(""); }} ownedOnly totalLimit={BOARD_MAX_TOTAL} selectionLabel="出せる" />
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <h3 className="font-semibold text-gray-800">欲しいポケふた</h3>
          <p className="mt-1 text-sm text-gray-500">すべてのポケふたから、合計30枚まで選択できます。</p>
        </div>
        <PokefutaQuantitySelector rows={pokefutaRows} quantities={wants} onChange={(next) => { setWants(next); setError(""); }} ownedOnly={false} totalLimit={BOARD_MAX_TOTAL} selectionLabel="欲しい" />
      </section>

      <section className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
        <label htmlFor="board-comment" className="font-semibold text-gray-800">任意コメント</label>
        <textarea
          id="board-comment"
          rows={5}
          maxLength={BOARD_COMMENT_MAX}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="交換条件や受け渡し方法などを入力してください。"
          className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
        <p className="text-right text-xs text-gray-500">{comment.length} / {BOARD_COMMENT_MAX}</p>
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center gap-3 px-4">
        <Link href="/board" className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 shadow-lg">キャンセル</Link>
        <button type="button" onClick={handleConfirm} className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600">
          内容を確認する
        </button>
      </div>
    </main>
  );
}
