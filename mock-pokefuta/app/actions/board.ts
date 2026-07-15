"use server";

import { revalidatePath } from "next/cache";
import { getAuthProfile } from "../lib/supabase/auth";
import { createClient } from "../lib/supabase/server";

type CreateBoardPostInput = { offers: number[]; wants: number[]; comment: string };

export async function createBoardPostAction(input: CreateBoardPostInput): Promise<{ postId: string } | { error: string }> {
  const offers = [...new Set(input.offers.map(Number).filter(Number.isInteger))];
  const wants = [...new Set(input.wants.map(Number).filter(Number.isInteger))];
  if (!offers.length || !wants.length || offers.length > 10 || wants.length > 10) return { error: "出せる・欲しいポケふたを各1〜10種類で選択してください。" };
  if (input.comment.length > 200) return { error: "コメントは200文字以内で入力してください。" };
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return { error: "Supabaseへ接続できません。" };
  const user = await getAuthProfile(supabase);
  if (!user) return { error: "投稿するにはログインが必要です。" };
  const { data: post, error: postError } = await supabase.from("board_posts").insert({ user_id: user.id, comment: input.comment.trim() || null }).select("id").single();
  if (postError || !post) return { error: "投稿の保存に失敗しました。" };
  const [{ error: offerError }, { error: wantError }] = await Promise.all([
    supabase.from("board_post_offers").insert(offers.map((pokefuta_id) => ({ post_id: post.id, pokefuta_id }))),
    supabase.from("board_post_wants").insert(wants.map((pokefuta_id) => ({ post_id: post.id, pokefuta_id }))),
  ]);
  if (offerError || wantError) {
    await supabase.from("board_posts").delete().eq("id", post.id);
    return { error: offerError ? "出せるポケふたは所持登録済みのものだけ選択できます。" : "交換内容の保存に失敗しました。" };
  }
  revalidatePath("/board");
  revalidatePath("/board/mine");
  revalidatePath("/");
  return { postId: String(post.id) };
}

async function authenticatedBoard() {
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return null;
  const user = await getAuthProfile(supabase);
  return user ? { supabase, user } : null;
}

export async function updateBoardPostAction(input: { postId: string; offers: number[]; wants: number[] }) {
  const auth = await authenticatedBoard();
  if (!auth) return { error: "ログインが必要です。" };
  const offers = [...new Set(input.offers)];
  const wants = [...new Set(input.wants)];
  if (!offers.length) return { error: "出せるポケふたを選んでください。" };
  if (!wants.length) return { error: "欲しいポケふたを選んでください。" };
  if (offers.length > 10 || wants.length > 10) return { error: "選択できるのは各10種類までです。" };
  const { error } = await auth.supabase.rpc("replace_board_post_selections", { target_post_id: input.postId, offer_ids: offers, want_ids: wants });
  if (error) return { error: "変更内容を保存できませんでした。所持状況を確認してください。" };
  revalidatePath(`/board/${input.postId}`); revalidatePath("/board"); revalidatePath("/board/mine");
  return { ok: true };
}

export async function manageBoardPostAction(input: { postId: string; operation: "close" | "extend" | "reopen" }) {
  const auth = await authenticatedBoard();
  if (!auth) return { error: "ログインが必要です。" };
  const values = input.operation === "close" ? { closed_at: new Date().toISOString() } : { closed_at: null, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() };
  const { error } = await auth.supabase.from("board_posts").update(values).eq("id", input.postId).eq("user_id", auth.user.id);
  if (error) return { error: "募集状態を更新できませんでした。" };
  revalidatePath(`/board/${input.postId}`); revalidatePath("/board"); revalidatePath("/board/mine");
  return { ok: true };
}

export async function createBoardCommentAction(input: { postId: string; body: string }) {
  const auth = await authenticatedBoard();
  if (!auth) return { error: "コメントするにはログインが必要です。" };
  const body = input.body.trim();
  if (!body || body.length > 200) return { error: "コメントを1〜200文字で入力してください。" };
  const { data, error } = await auth.supabase.from("board_comments").insert({ post_id: input.postId, user_id: auth.user.id, body }).select("id").single();
  if (error || !data) return { error: "コメントを送信できませんでした。" };
  revalidatePath(`/board/${input.postId}`); revalidatePath("/board");
  return { comment: { id: data.id, user: { id: auth.user.user_id, nickname: auth.user.nickname }, body, postedAt: "たった今", isMine: true } };
}

export async function deleteBoardCommentAction(input: { postId: string; commentId: string }) {
  const auth = await authenticatedBoard();
  if (!auth) return { error: "ログインが必要です。" };
  const { error } = await auth.supabase.from("board_comments").delete().eq("id", input.commentId).eq("post_id", input.postId).eq("user_id", auth.user.id);
  if (error) return { error: "コメントを削除できませんでした。" };
  revalidatePath(`/board/${input.postId}`); revalidatePath("/board");
  return { ok: true };
}
