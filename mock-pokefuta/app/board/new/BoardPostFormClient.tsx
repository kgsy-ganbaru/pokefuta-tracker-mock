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
  const [validationMessage, setValidationMessage] = useState("");

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
      setValidationMessage("「出」のポケふたを1種類以上選んでください。");
      return;
    }
    if (wants.length === 0) {
      setValidationMessage("「求」のポケふたを1種類以上選んでください。");
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
          <h2 className="text-2xl font-bold text-emerald-700">出</h2>
          <p className="mt-1 text-sm text-gray-500">所持登録しているものから、最大10種類まで選択できます。</p>
        </div>
        <PokefutaSelector rows={pokefutaRows} selectedIds={offers} onChange={setOffers} ownedOnly selectionLabel="出" limit={BOARD_MAX_TYPES} />
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-amber-700">求</h2>
          <p className="mt-1 text-sm text-gray-500">すべてのポケふたから、最大10種類まで選択できます。</p>
        </div>
        <PokefutaSelector rows={pokefutaRows} selectedIds={wants} onChange={setWants} ownedOnly={false} selectionLabel="求" limit={BOARD_MAX_TYPES} />
      </section>

      <section className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
        <label htmlFor="board-comment" className="font-semibold text-gray-800">任意コメント</label>
        <textarea id="board-comment" rows={5} maxLength={BOARD_COMMENT_MAX} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="交換条件や受け渡し方法などを入力してください。" className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
        <p className="text-right text-xs text-gray-500">{comment.length} / {BOARD_COMMENT_MAX}</p>
      </section>

      {validationMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" role="presentation" onClick={() => setValidationMessage("")}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="board-validation-title" className="w-full max-w-sm rounded-2xl border bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h2 id="board-validation-title" className="text-base font-semibold text-gray-800">入力内容を確認してください</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">{validationMessage}</p>
            <button type="button" autoFocus onClick={() => setValidationMessage("")} className="pft-primary-button mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold">閉じる</button>
          </div>
        </div>
      )}

      <MobileActionBar>
        <Link href="/board" className="rounded-full border bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm">キャンセル</Link>
        <button type="button" onClick={handleConfirm} className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-600">内容を確認する</button>
      </MobileActionBar>
    </main>
  );
}
