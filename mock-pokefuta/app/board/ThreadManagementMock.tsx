"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { manageBoardPostAction } from "../actions/board";

export default function ThreadManagementMock({ initiallyActive, threadId, dataBacked = false }: { initiallyActive: boolean; threadId: string; dataBacked?: boolean }) {
  const router = useRouter();
  const [active, setActive] = useState(initiallyActive);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const operate = (operation: "close" | "extend" | "reopen") => {
    if (operation === "close" && !window.confirm("この投稿の募集を終了しますか？")) return;
    if (!dataBacked) { setActive(operation !== "close"); setNotice("募集状態を変更しました（モック表示）。"); return; }
    startTransition(async () => { const result = await manageBoardPostAction({ postId: threadId, operation }); if ("error" in result) { setNotice(result.error ?? "更新できませんでした。"); return; } setActive(operation !== "close"); setNotice("募集状態を更新しました。"); router.refresh(); });
  };
  return <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold text-gray-800">投稿の管理</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>{active ? "募集中" : "募集終了"}</span></div><p className="text-xs leading-5 text-gray-600">投稿は7日後に自動終了します。募集中なら期限を7日延長できます。</p><div className="flex flex-wrap gap-2"><Link href={`/board/${threadId}/edit`} className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700">投稿内容を編集する</Link>{active ? <><button disabled={pending} type="button" onClick={() => operate("extend")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">7日間延長する</button><button disabled={pending} type="button" onClick={() => operate("close")} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">募集を終了する</button></> : <button disabled={pending} type="button" onClick={() => operate("reopen")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">同じ内容でもう一度募集する</button>}</div>{notice && <p role="status" className="text-xs font-medium text-emerald-800">{notice}</p>}</section>;
}
