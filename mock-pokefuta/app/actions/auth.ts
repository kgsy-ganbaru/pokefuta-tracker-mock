"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { userIdToEmail } from "../lib/supabase/auth";

export type LoginState = {
  error?: string;
};

export type RegisterState = {
  error?: string;
};

export type LogoutState = {
  error?: string;
};

const MIN_PASSWORD_LENGTH = 6;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !password) {
    return { error: "ユーザーIDとパスワードを入力してください" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`,
    };
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

export async function logoutAction(
  _prevState: LogoutState,
  _formData: FormData
): Promise<LogoutState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }
  await supabase.auth.signOut();
  redirect("/account");
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !nickname || !password) {
    return { error: "ユーザーID・ニックネーム・パスワードを入力してください" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const { data: existingUser, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    return { error: "ユーザーIDの確認に失敗しました" };
  }

  if (existingUser) {
    return { error: "このユーザーIDは既に使用されています" };
  }

  const { data, error } = await supabase.auth.signUp({
    email: userIdToEmail(userId),
    password,
    options: {
      data: {
        nickname,
        user_id: userId,
      },
    },
  });

  if (error || !data.user) {
    const message = error?.message ?? "";
    if (
      error?.code === "23505" ||
      message.includes("already registered") ||
      message.includes("duplicate key")
    ) {
      return { error: "このユーザーIDは既に使用されています" };
    }
    return { error: "新規登録に失敗しました" };
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: data.user.id,
    user_id: userId,
    nickname,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "このユーザーIDは既に使用されています" };
    }
    return { error: "新規登録に失敗しました" };
  }

  redirect("/account");
}
