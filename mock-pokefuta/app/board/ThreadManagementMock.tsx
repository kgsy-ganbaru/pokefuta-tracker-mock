"use client";

import { useState } from "react";
import Link from "next/link";

export default function ThreadManagementMock({ initiallyActive, threadId }: { initiallyActive: boolean; threadId: string }) {
  const [active, setActive] = useState(initiallyActive);
  const [notice, setNotice] = useState("");
  const close = () => {
    if (!window.confirm("この投稿の募集を終了しますか？")) return;
    setActive(false); setNotice("募集を終了しました（モック表示）。");
  };
  const activate = (message: string) => { setActive(true); setNotice(message); };
  return (
    <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-800">投稿の管理</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-600"}`}>{active ? "募集中" : "募集終了"}</span></div>
      <p className="text-xs leading-5 text-gray-600">投稿は7日後に自動終了します。まだ募集中なら、期限を7日間延長できます。</p>
      <div className="flex flex-wrap gap-2">
        <Link href={`/board/${threadId}/edit`} className="rounded-full border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700">投稿内容を編集する</Link>
        {active ? <><button type="button" onClick={() => activate("募集期限を7日間延長しました（モック表示）。")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">7日間延長する</button><button type="button" onClick={close} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-gray-700">募集を終了する</button></> : <button type="button" onClick={() => activate("同じ内容で7日間の募集を再開しました（モック表示）。")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">同じ内容でもう一度募集する</button>}
      </div>
      {notice && <p role="status" className="text-xs font-medium text-emerald-800">{notice}</p>}
    </section>
  );
}
