"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { userIdToEmail } from "../lib/supabase/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !password) {
    return { error: "ユーザーIDとパスワードを入力してください" };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: userIdToEmail(userId),
    password,
  });

  if (error) {
    return { error: "ユーザーIDまたはパスワードが違います" };
  }

  redirect("/account");
}

export async function logoutAction() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/account");
  }
  await supabase.auth.signOut();
  redirect("/account");
}