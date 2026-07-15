import Link from "next/link";
import ThreadManagementMock from "../ThreadManagementMock";
import { boardThreads, isThreadActive, remainingDays } from "../mockThreads";

export default function MyBoardPostsPage() {
  const mine = boardThreads.filter((thread) => thread.isMine);
  return <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6"><header><Link href="/board" className="text-sm font-semibold text-emerald-700">← 掲示板に戻る</Link><h1 className="mt-3 text-xl font-semibold text-gray-800">自分の投稿</h1><p className="mt-2 text-sm text-gray-500">募集中と終了済みの投稿をまとめて管理できます。</p></header><div className="space-y-4">{mine.map((thread) => { const active = isThreadActive(thread); return <article key={thread.id} className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><Link href={`/board/${thread.id}`} className="font-semibold text-emerald-700 hover:underline">出せる {thread.offers.length}種類 ／ 欲しい {thread.wants.length}種類</Link><p className="mt-1 text-xs text-gray-500">更新 {thread.updatedAt}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>{active ? `あと${remainingDays(thread)}日` : "募集終了"}</span></div><p className="line-clamp-2 text-sm text-gray-600">{thread.comment}</p><ThreadManagementMock initiallyActive={active} threadId={thread.id} /></article>; })}</div></main>;
}
