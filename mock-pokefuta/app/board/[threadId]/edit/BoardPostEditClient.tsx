"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateBoardPostAction } from "../../../actions/board";
import { PokefutaRow } from "../../../lib/pokefuta/listData";
import PokefutaSelector from "../../new/PokefutaSelector";

export default function BoardPostEditClient({ threadId, rows, initialOffers, initialWants, dataBacked = false }: { threadId: string; rows: PokefutaRow[]; initialOffers: number[]; initialWants: number[]; dataBacked?: boolean }) {
  const router = useRouter(); const [offers, setOffers] = useState(initialOffers); const [wants, setWants] = useState(initialWants); const [error, setError] = useState(""); const [pending, startTransition] = useTransition();
  const save = () => { if (!offers.length) { setError("出せるポケふたを1種類以上選んでください。"); return; } if (!wants.length) { setError("欲しいポケふたを1種類以上選んでください。"); return; } if (!dataBacked) return; startTransition(async () => { const result = await updateBoardPostAction({ postId: threadId, offers, wants }); if ("error" in result) { setError(result.error ?? "保存できませんでした。"); return; } router.push(`/board/${threadId}`); router.refresh(); }); };
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-28"><header><Link href={`/board/${threadId}`} className="text-sm font-semibold text-emerald-700">← 投稿詳細に戻る</Link><h1 className="mt-3 text-xl font-semibold text-gray-800">投稿内容を編集</h1><p className="mt-2 text-sm text-gray-500">出せるポケふたと欲しいポケふたを変更できます。</p></header><section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold text-gray-800">出せるポケふた</h2><PokefutaSelector rows={rows} selectedIds={offers} onChange={(next) => { setOffers(next); setError(""); }} ownedOnly selectionLabel="出せる" limit={10} /></section><section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold text-gray-800">欲しいポケふた</h2><PokefutaSelector rows={rows} selectedIds={wants} onChange={(next) => { setWants(next); setError(""); }} ownedOnly={false} selectionLabel="欲しい" limit={10} /></section>{error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center gap-3 px-4"><Link href={`/board/${threadId}`} className="rounded-full border bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-lg">キャンセル</Link><button disabled={pending} type="button" onClick={save} className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50">{pending ? "保存中…" : "変更を保存する"}</button></div></main>;
}
