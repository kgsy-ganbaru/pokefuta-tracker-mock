import Link from "next/link";
import { getCachedAuthProfile } from "../../lib/supabase/auth";
import { createClient } from "../../lib/supabase/server";
import ThreadManagementMock from "../ThreadManagementMock";
import { fetchBoardThreads } from "../boardData";
import { boardThreads, isThreadActive, remainingDays } from "../mockThreads";

export const dynamic = "force-dynamic";
export default async function MyBoardPostsPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams; const fromAccount = from === "account"; const supabase = await createClient(); const user = await getCachedAuthProfile();
  const mine = supabase && user ? await fetchBoardThreads(supabase, user.id, { includeClosed: true, ownerOnly: true }) : supabase ? [] : boardThreads.filter((thread) => thread.isMine);
  return <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6"><header>{!fromAccount && <Link href="/board" className="pft-back-button">掲示板に戻る</Link>}<h1 className={`${fromAccount ? "" : "mt-3"} text-xl font-semibold text-gray-800`}>自分の投稿</h1><p className="mt-2 text-sm text-gray-500">募集中と募集終了の投稿をまとめて確認できます。</p></header>{supabase && !user ? <section className="rounded-xl border bg-white p-6 text-center"><p className="text-sm text-gray-600">自分の投稿を見るにはログインしてください。</p><Link href="/account" className="mt-4 inline-block font-semibold text-emerald-700">ログインする</Link></section> : mine.length === 0 ? <section className="rounded-xl border border-dashed bg-white p-8 text-center"><p className="text-sm text-gray-600">投稿はまだありません。</p><Link href="/board/new" className="mt-4 inline-block font-semibold text-emerald-700">新しく投稿する</Link></section> : <div className="space-y-4">{mine.map((thread) => { const active = isThreadActive(thread); return <article key={thread.id} className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><Link href={`/board/${thread.id}`} className="font-semibold text-emerald-700 hover:underline">出 {thread.offers.length}種類 ／ 求 {thread.wants.length}種類</Link><p className="mt-1 text-xs text-gray-500">更新日：{thread.updatedAt}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>{active ? `あと${remainingDays(thread)}日` : "募集終了"}</span></div><p className="line-clamp-2 text-sm text-gray-600">{thread.comment || "コメントはありません。"}</p><ThreadManagementMock initiallyActive={active} threadId={thread.id} dataBacked={Boolean(supabase)} /></article>; })}</div>}</main>;
}
