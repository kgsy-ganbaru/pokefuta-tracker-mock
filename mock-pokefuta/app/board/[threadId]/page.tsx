import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthProfile } from "../../lib/supabase/auth";
import { createClient } from "../../lib/supabase/server";
import ImageWithFallback from "../../components/ImageWithFallback";
import FriendCodeCopyButton from "../FriendCodeCopyButton";
import ThreadManagementMock from "../ThreadManagementMock";
import BoardCommentsMock from "../BoardCommentsMock";
import { BoardCommentDraftProvider, DraftAwareUserLink } from "../BoardCommentDraftNavigation";
import { fetchBoardThreads } from "../boardData";
import { BoardItem, boardThreads, isThreadActive, remainingDays } from "../mockThreads";

export const dynamic = "force-dynamic";
function ItemGrid({ items }: { items: BoardItem[] }) { return <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">{items.map((item) => <div key={item.id} className="rounded-xl border bg-white p-2 text-center shadow-sm"><div className="relative mx-auto aspect-square w-full"><ImageWithFallback src={item.image} alt="" className="h-full w-full object-contain p-2" /></div><p className="mt-1 truncate text-xs font-semibold text-gray-700">{item.city}</p><p className="truncate text-[10px] text-gray-500">{item.pokemon}</p></div>)}</div>; }

export default async function BoardThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params; const supabase = await createClient(); const user = await getAuthProfile(supabase);
  const thread = supabase ? (await fetchBoardThreads(supabase, user?.id ?? null, { includeClosed: true, threadId }))[0] : boardThreads.find((item) => item.id === threadId);
  if (!thread) notFound();
  const active = isThreadActive(thread);
  return <BoardCommentDraftProvider><main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6"><Link href="/board" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">掲示板に戻る</Link><header className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-500">投稿者</p><DraftAwareUserLink href={`/users/${thread.user.id}`} className="font-semibold text-emerald-700 hover:underline">{thread.user.nickname}</DraftAwareUserLink><p className="mt-1 text-xs text-gray-500">更新 {thread.updatedAt}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>{active ? `募集中・あと${remainingDays(thread)}日` : "募集終了"}</span></div>{thread.user.friendCode && <div className="mt-3 border-t pt-3"><p className="mb-2 text-xs text-gray-500">Pokémon HOME フレンドコード</p><FriendCodeCopyButton code={thread.user.friendCode} showCode /></div>}</header>{thread.isMine && <ThreadManagementMock initiallyActive={active} threadId={thread.id} dataBacked={Boolean(supabase)} />}<section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-emerald-700">出</h2><span className="text-sm font-semibold">{thread.offers.length}種類</span></div><ItemGrid items={thread.offers} /></section><section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-amber-700">求</h2><span className="text-sm font-semibold">{thread.wants.length}種類</span></div><ItemGrid items={thread.wants} /></section><section className="rounded-xl border bg-white p-4 shadow-sm"><h2 className="font-semibold text-gray-800">投稿者コメント</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{thread.comment || "コメントはありません。"}</p></section><BoardCommentsMock initialComments={thread.comments} postId={thread.id} dataBacked={Boolean(supabase)} isLoggedIn={Boolean(user)} isActive={active} /></main></BoardCommentDraftProvider>;
}
