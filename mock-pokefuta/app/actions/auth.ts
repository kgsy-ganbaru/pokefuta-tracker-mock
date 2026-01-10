"use server";

import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "../lib/supabase/server";
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

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
  nickname?: string;
  comment?: string;
  friendCode?: string;
};

const MIN_PASSWORD_LENGTH = 6;
const MAX_COMMENT_LENGTH = 200;
const FRIEND_CODE_LENGTH = 12;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !password) {
    return { error: "ユーザIDとパスワードを入力してください" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`,
    };
  }

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: userIdToEmail(userId),
    password,
  });

  if (error) {
    return { error: "ユーザIDまたはパスワードが違います" };
  }

  redirect("/account");
}

export async function logoutAction(
  _prevState: LogoutState,
  _formData: FormData
): Promise<LogoutState> {
  const supabase = await createClient({ cookieMode: "read-write" });
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
    return { error: "ユーザID・ニックネーム・パスワードを入力してください" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`,
    };
  }

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const { data: existingUser, error: existingError } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) {
    return { error: "ユーザIDの確認に失敗しました" };
  }

  if (existingUser) {
    return { error: "このユーザIDは既に使用されています" };
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
      return { error: "このユーザIDは既に使用されています" };
    }
    return { error: "新規登録に失敗しました" };
  }

  const adminSupabase = createAdminClient();
  if (!adminSupabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const { error: insertError } = await adminSupabase.from("users").insert({
    id: data.user.id,
    user_id: userId,
    nickname,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: "このユーザIDは既に使用されています" };
    }
    return { error: "新規登録に失敗しました" };
  }

  redirect("/account");
}

export async function updateProfileAction(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const comment = String(formData.get("comment") ?? "");
  const friendCodeRaw = String(formData.get("friendCode") ?? "").trim();
  const friendCode = friendCodeRaw.replace(/\s+/g, "").toUpperCase();

  if (!nickname) {
    return { error: "ニックネームを入力してください" };
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    return {
      error: `コメントは${MAX_COMMENT_LENGTH}文字以内で入力してください`,
    };
  }

  if (friendCode && friendCode.length !== FRIEND_CODE_LENGTH) {
    return {
      error: `フレンドコードは${FRIEND_CODE_LENGTH}文字で入力してください`,
    };
  }

  if (friendCode && !/^[A-Z0-9]+$/.test(friendCode)) {
    return { error: "フレンドコードは英数字で入力してください" };
  }

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログイン情報を確認できませんでした" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      nickname,
      comment,
      friend_code: friendCode ? friendCode : null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "プロフィールの更新に失敗しました" };
  }

  return {
    success: true,
    nickname,
    comment,
    friendCode: friendCode ? friendCode : undefined,
  };
}
