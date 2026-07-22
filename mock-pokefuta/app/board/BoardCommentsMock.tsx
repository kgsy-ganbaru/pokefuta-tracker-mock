"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { createBoardCommentAction, deleteBoardCommentAction } from "../actions/board";
import { BoardComment } from "./mockThreads";
import { DraftAwareUserLink, useBoardCommentDraft } from "./BoardCommentDraftNavigation";
import LoadingOverlay from "../components/LoadingOverlay";

export default function BoardCommentsMock({ initialComments, postId, dataBacked = false, isLoggedIn = false, isActive = true }: { initialComments: BoardComment[]; postId?: string; dataBacked?: boolean; isLoggedIn?: boolean; isActive?: boolean }) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const { setHasCommentDraft } = useBoardCommentDraft();
  useEffect(() => { setHasCommentDraft(body.trim().length > 0); return () => setHasCommentDraft(false); }, [body, setHasCommentDraft]);
  const submit = () => { const trimmed = body.trim(); if (!trimmed) { setError("コメントを入力してください。"); return; } if (!postId) return; startTransition(async () => { const result = await createBoardCommentAction({ postId, body: trimmed }); if ("error" in result) { setError(result.error ?? "送信できませんでした。"); return; } setComments((current) => [...current, result.comment]); setBody(""); setError(""); }); };
  const remove = (commentId: string) => { if (!postId || !window.confirm("このコメントを削除しますか？")) return; startTransition(async () => { const result = await deleteBoardCommentAction({ postId, commentId }); if ("error" in result) { setError(result.error ?? "削除できませんでした。"); return; } setComments((current) => current.filter((comment) => comment.id !== commentId)); }); };
  return <section className="space-y-4 rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold text-gray-800">コメント</h2><span className="text-sm text-gray-500">{comments.length}件</span></div>{comments.length === 0 ? <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">まだコメントはありません。</p> : <div className="divide-y">{comments.map((comment) => <article key={comment.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><DraftAwareUserLink href={`/users/${comment.user.id}`} className="text-sm font-semibold text-emerald-700 hover:underline">{comment.user.nickname}</DraftAwareUserLink><div className="flex items-center gap-3"><time className="text-xs text-gray-400">{comment.postedAt}</time>{dataBacked && comment.isMine && <button disabled={pending} type="button" onClick={() => remove(comment.id)} className="text-xs font-semibold text-red-600">削除</button>}</div></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{comment.body}</p></article>)}</div>}{!dataBacked || (isLoggedIn && isActive) ? <div className="space-y-2 border-t pt-4"><label htmlFor="board-reply" className="text-sm font-semibold text-gray-800">コメントを追加</label><textarea id="board-reply" rows={4} maxLength={200} value={body} onChange={(event) => { setBody(event.target.value); setError(""); }} placeholder="交換条件やフレンド追加について相談できます。" className="w-full resize-y rounded-lg border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="text-right text-xs text-gray-500">{body.length} / 200</div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={pending} type="button" onClick={submit} className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">コメントする</button></div> : <p className="border-t pt-4 text-center text-sm text-gray-500">{!isLoggedIn ? <><Link href="/account" className="font-semibold text-emerald-700">ログイン</Link>するとコメントできます。</> : "募集終了後はコメントできません。"}</p>}{pending && <LoadingOverlay />}</section>;
}
