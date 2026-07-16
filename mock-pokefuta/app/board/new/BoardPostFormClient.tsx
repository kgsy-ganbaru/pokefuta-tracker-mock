"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PokefutaRow } from "../../lib/pokefuta/listData";
import PokefutaSelector from "./PokefutaSelector";
import MobileActionBar from "../../components/MobileActionBar";
import PageBackLink from "../../components/PageBackLink";

export const BOARD_DRAFT_KEY = "boardPostDraft";
export const BOARD_MAX_TYPES = 10;
export const BOARD_COMMENT_MAX = 200;

export type BoardPostDraft = {
  poster: { userId: string; nickname: string };
  offers: number[];
  wants: number[];
  comment: string;
  rows: PokefutaRow[];
};

export default function BoardPostFormClient({
  pokefutaRows,
  poster,
}: {
  pokefutaRows: PokefutaRow[];
  poster: { user_id: string; nickname: string };
}) {
  const router = useRouter();
  const [offers, setOffers] = useState<number[]>([]);
  const [wants, setWants] = useState<number[]>([]);
  const [comment, setComment] = useState("交換お願いします！");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(BOARD_DRAFT_KEY);
    if (!stored) return;
    try {
      const draft = JSON.parse(stored) as BoardPostDraft;
      const frame = window.requestAnimationFrame(() => {
        setOffers(Array.isArray(draft.offers) ? draft.offers : []);
        setWants(Array.isArray(draft.wants) ? draft.wants : []);
        setComment(draft.comment ?? "");
      });
      return () => window.cancelAnimationFrame(frame);
    } catch {
      window.localStorage.removeItem(BOARD_DRAFT_KEY);
    }
  }, []);

  const handleConfirm = () => {
    if (offers.length === 0) {
      setError("出せるポケふたを1種類以上選んでください。");
      return;
    }
    if (wants.length === 0) {
      setError("欲しいポケふたを1種類以上選んでください。");
      return;
    }
    const selectedIds = new Set([...offers, ...wants]);
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
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-40">
      <header>
        <PageBackLink href="/board" label="掲示板に戻る" />
        <p className="mt-3 text-sm text-gray-500">画像をタップして、交換したいポケふたを選んでください。</p>
      </header>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-800">出せるポケふた</h2>
          <p className="mt-1 text-sm text-gray-500">所持登録しているものから、最大10種類まで選択できます。</p>
        </div>
        <PokefutaSelector rows={pokefutaRows} selectedIds={offers} onChange={(next) => { setOffers(next); setError(""); }} ownedOnly selectionLabel="出せる" limit={BOARD_MAX_TYPES} />
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <h2 className="font-semibold text-gray-800">欲しいポケふた</h2>
          <p className="mt-1 text-sm text-gray-500">すべてのポケふたから、最大10種類まで選択できます。</p>
        </div>
        <PokefutaSelector rows={pokefutaRows} selectedIds={wants} onChange={(next) => { setWants(next); setError(""); }} ownedOnly={false} selectionLabel="欲しい" limit={BOARD_MAX_TYPES} />
      </section>

      <section className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
        <label htmlFor="board-comment" className="font-semibold text-gray-800">任意コメント</label>
        <textarea id="board-comment" rows={5} maxLength={BOARD_COMMENT_MAX} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="交換条件や受け渡し方法などを入力してください。" className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
        <p className="text-right text-xs text-gray-500">{comment.length} / {BOARD_COMMENT_MAX}</p>
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <MobileActionBar>
        <Link href="/board" className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm">キャンセル</Link>
        <button type="button" onClick={handleConfirm} className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600">内容を確認する</button>
      </MobileActionBar>
    </main>
  );
}
