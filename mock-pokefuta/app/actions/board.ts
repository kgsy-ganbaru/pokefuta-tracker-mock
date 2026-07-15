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
