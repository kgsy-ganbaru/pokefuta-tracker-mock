"use client";

import { useEffect, useState } from "react";
import { BoardComment } from "./mockThreads";
import { DraftAwareUserLink, useBoardCommentDraft } from "./BoardCommentDraftNavigation";

const COMMENT_MAX = 200;

export default function BoardCommentsMock({ initialComments }: { initialComments: BoardComment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const { setHasCommentDraft } = useBoardCommentDraft();

  useEffect(() => {
    setHasCommentDraft(body.trim().length > 0);
    return () => setHasCommentDraft(false);
  }, [body, setHasCommentDraft]);

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) { setError("コメントを入力してください。"); return; }
    setComments((current) => [...current, { id: `mock-${Date.now()}`, user: { id: "demo-user", nickname: "デモユーザー" }, body: trimmed, postedAt: "たった今" }]);
    setBody("");
    setError("");
  };

  return (
    <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-800">コメント</h2><span className="text-sm text-gray-500">{comments.length}件</span></div>
      {comments.length === 0 ? <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">まだコメントはありません。</p> : <div className="divide-y">{comments.map((comment) => <article key={comment.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><DraftAwareUserLink href={`/users/${comment.user.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">{comment.user.nickname}</DraftAwareUserLink><time className="shrink-0 text-xs text-gray-400">{comment.postedAt}</time></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{comment.body}</p></article>)}</div>}
      <div className="space-y-2 border-t pt-4"><label htmlFor="board-reply" className="text-sm font-semibold text-gray-800">コメントを追加</label><textarea id="board-reply" rows={4} maxLength={COMMENT_MAX} value={body} onChange={(event) => { setBody(event.target.value); setError(""); }} placeholder="交換条件やフレンド追加について相談できます。" className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="flex items-center justify-between"><span className="text-xs text-gray-500">コメント投稿では募集期限は延長されません。</span><span className="text-xs text-gray-500">{body.length} / {COMMENT_MAX}</span></div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button type="button" onClick={submit} className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">コメントする</button><p className="text-center text-xs text-amber-700">現在はモックのため、再読み込みすると追加コメントは消えます。</p></div>
    </section>
  );
}
