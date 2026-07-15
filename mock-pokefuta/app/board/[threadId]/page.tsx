import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardItem, boardThreads, totalSheets } from "../mockThreads";

function ItemGrid({ items }: { items: BoardItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border bg-white p-2 text-center shadow-sm">
          <div className="relative mx-auto aspect-square w-full">
            <Image src={item.image} alt="" fill className="object-contain p-2" />
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-gray-700">{item.city}</p>
          <p className="truncate text-[10px] text-gray-500">{item.pokemon}</p>
          <p className="mt-1 text-sm font-bold text-emerald-700">{item.count}枚</p>
        </div>
      ))}
    </div>
  );
}

export default async function BoardThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const thread = boardThreads.find((item) => item.id === threadId);
  if (!thread) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link href="/board" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">← 掲示板に戻る</Link>
      <header className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">投稿者</p>
          <Link href={`/users/${thread.user.id}`} className="font-semibold text-emerald-700 hover:underline">{thread.user.nickname}</Link>
          <p className="mt-1 text-xs text-gray-500">更新 {thread.updatedAt}</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{thread.status}</span>
      </header>

      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="font-bold text-emerald-700">出せるポケふた</h2><span className="text-sm font-semibold">合計 {totalSheets(thread.offers)}枚</span></div>
        <ItemGrid items={thread.offers} />
      </section>
      <section className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between"><h2 className="font-bold text-amber-700">欲しいポケふた</h2><span className="text-sm font-semibold">合計 {totalSheets(thread.wants)}枚</span></div>
        <ItemGrid items={thread.wants} />
      </section>
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-gray-800">コメント</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">{thread.comment}</p>
      </section>
      <section className="rounded-xl border border-dashed bg-gray-50 p-6 text-center text-sm text-gray-500">
        コメント一覧と投稿欄は次の実装で追加します。現在のコメント数：{thread.replies}件
      </section>
    </main>
  );
}
