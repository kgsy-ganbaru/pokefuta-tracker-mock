"use client";

import Link from "next/link";
import { useState } from "react";
import { PokefutaRow } from "../../../lib/pokefuta/listData";
import PokefutaSelector from "../../new/PokefutaSelector";

const MAX_TYPES = 10;

export default function BoardPostEditClient({ threadId, rows, initialOffers, initialWants }: { threadId: string; rows: PokefutaRow[]; initialOffers: number[]; initialWants: number[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [wants, setWants] = useState(initialWants);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const save = () => {
    if (offers.length === 0 || wants.length === 0) { setError("出せるポケふたと欲しいポケふたを、それぞれ1種類以上選択してください。"); return; }
    setSaved(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28">
      <header><Link href={`/board/${threadId}`} className="text-sm font-semibold text-emerald-700">← 投稿詳細に戻る</Link><h1 className="mt-3 text-xl font-semibold text-gray-800">投稿内容を編集</h1><p className="mt-2 text-sm text-gray-500">出せるポケふたと欲しいポケふただけを変更できます。</p></header>
      {saved && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">変更内容を保存しました。現在はモックのため、再読み込みすると元に戻ります。</p>}
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div><h2 className="font-semibold text-gray-800">出せるポケふた</h2><p className="mt-1 text-sm text-gray-500">所持登録しているものから最大10種類まで選択できます。</p></div><PokefutaSelector rows={rows} selectedIds={offers} onChange={(next) => { setOffers(next); setSaved(false); setError(""); }} ownedOnly selectionLabel="出せる" limit={MAX_TYPES} /></section>
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div><h2 className="font-semibold text-gray-800">欲しいポケふた</h2><p className="mt-1 text-sm text-gray-500">すべてのポケふたから最大10種類まで選択できます。</p></div><PokefutaSelector rows={rows} selectedIds={wants} onChange={(next) => { setWants(next); setSaved(false); setError(""); }} ownedOnly={false} selectionLabel="欲しい" limit={MAX_TYPES} /></section>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center gap-3 px-4"><Link href={`/board/${threadId}`} className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-lg">キャンセル</Link><button type="button" onClick={save} className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700">変更を保存する</button></div>
    </main>
  );
}
