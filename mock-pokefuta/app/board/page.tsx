import Image from "next/image";
import Link from "next/link";
import FriendCodeCopyButton from "./FriendCodeCopyButton";
import { BoardItem, boardThreads, isThreadActive, remainingDays } from "./mockThreads";

const PREVIEW_ITEM_LIMIT = 4;

function ItemPreview({ items, tone }: { items: BoardItem[]; tone: "offer" | "want" }) {
  const hiddenCount = Math.max(0, items.length - PREVIEW_ITEM_LIMIT);
  return <div><div className="grid grid-cols-4 gap-2">{items.slice(0, PREVIEW_ITEM_LIMIT).map((item) => <div key={item.id} className={`rounded-xl border p-1.5 text-center ${tone === "offer" ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}><div className="relative mx-auto aspect-square w-full max-w-16"><Image src={item.image} alt="" fill className="object-contain p-1" /></div><p className="mt-2 truncate text-[11px] font-semibold text-gray-700">{item.city}</p></div>)}</div><p className="mt-2 text-right text-xs font-semibold text-gray-500">{hiddenCount > 0 ? `ほか${hiddenCount}種類` : `${items.length}種類`}</p></div>;
}

export default function BoardPage() {
  const activeThreads = boardThreads.filter(isThreadActive);
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="space-y-3"><div className="flex items-center justify-between gap-3"><h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800"><Image src="/status-any-owned-pokeball.svg" alt="" width={20} height={20} />掲示板</h1><Link href="/board/mine" className="text-sm font-semibold text-emerald-700">自分の投稿</Link></div><p className="text-sm text-gray-500">出せるポケふたと欲しいポケふたを確認して、交換相手を探せます。</p></header>
      <Link href="/board/new" className="block w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">新しく投稿する</Link>
      <section aria-label="投稿一覧" className="space-y-4">{activeThreads.map((thread) => {
        const days = remainingDays(thread);
        return <article key={thread.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md"><div className="flex items-center justify-between gap-3 border-b px-4 py-3"><div className="flex min-w-0 items-center gap-2"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{thread.user.nickname.slice(0, 1)}</div><div className="min-w-0"><Link href={`/users/${thread.user.id}`} className="block truncate text-sm font-semibold text-emerald-700 hover:underline">{thread.user.nickname}</Link><p className="text-[11px] text-gray-500">更新 {thread.updatedAt}</p></div></div><div className="flex flex-col items-end gap-1"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${days <= 1 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{days <= 1 ? "まもなく終了" : "募集中"}・あと{days}日</span><FriendCodeCopyButton code={thread.user.friendCode} /></div></div><Link href={`/board/${thread.id}`} className="block space-y-5 p-4"><section className="space-y-2"><h2 className="text-sm font-bold text-emerald-700">出せるポケふた</h2><ItemPreview items={thread.offers} tone="offer" /></section><section className="space-y-2"><h2 className="text-sm font-bold text-amber-700">欲しいポケふた</h2><ItemPreview items={thread.wants} tone="want" /></section><p className="line-clamp-2 text-sm leading-6 text-gray-600">{thread.comment}</p><div className="flex items-center justify-between border-t pt-3 text-xs text-gray-500"><span className="font-medium text-emerald-700">投稿の詳細を見る →</span><span>コメント {thread.replies}件</span></div></Link></article>;
      })}</section>
    </main>
  );
}
