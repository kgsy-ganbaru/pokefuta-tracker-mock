"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient, createClient } from "../lib/supabase/server";
import { userIdToEmail } from "../lib/supabase/auth";

export type LoginState = {
  error?: string;
};

export type RegisterState = {
  error?: string;
};

export type EmailActionState = { error?: string; success?: string };

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

const MIN_PASSWORD_LENGTH = 8;
const MAX_COMMENT_LENGTH = 200;
const FRIEND_CODE_LENGTH = 12;

async function resolveEmailForLogin(loginId: string) {
  if (loginId.includes("@")) return loginId.toLowerCase();
  const admin = createAdminClient();
  if (admin) {
    const { data } = await admin
      .from("login_identities")
      .select("email")
      .eq("login_id", loginId)
      .maybeSingle();
    if (data?.email) return String(data.email);
  }
  return userIdToEmail(loginId);
}

function emailErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already") || normalized.includes("exists") || normalized.includes("registered")) {
    return "このメールアドレスは既に使用されています。パスワード再設定をお試しください。";
  }
  if (normalized.includes("rate") || normalized.includes("limit")) {
    return "短時間に操作が集中しています。少し時間をおいてからお試しください。";
  }
  return "メールアドレスを更新できませんでした。入力内容を確認して、もう一度お試しください。";
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !password) {
    return { error: "ユーザIDとパスワードを入力してください" };
  }
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }
  const email = await resolveEmailForLogin(userId);

  const { error } = await supabase.auth.signInWithPassword({
    email,
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
  void _prevState;
  void _formData;
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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!userId || !nickname || !email || !password || !passwordConfirmation) {
    return { error: "すべての項目を入力してください" };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください`,
    };
  }
  if (password !== passwordConfirmation) return { error: "確認用パスワードが一致しません" };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "正しいメールアドレスを入力してください" };

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

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
      data: {
        nickname,
        user_id: userId,
      },
    },
  });

  if (data.user?.identities?.length === 0) {
    return { error: "このメールアドレスは既に使用されています。ログインまたはパスワード再設定をお試しください。" };
  }
  if (error || !data.user) {
    const message = error?.message ?? "";
    if (
      error?.code === "23505" ||
      message.includes("already registered") ||
      message.includes("duplicate key")
    ) {
      return { error: "このユーザIDまたはメールアドレスは既に使用されています" };
    }
    console.error("Email signup failed", { code: error?.code, message });
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
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    if (insertError.code === "23505") {
      return { error: "このユーザIDは既に使用されています" };
    }
    return { error: "新規登録に失敗しました" };
  }

  const { error: identityError } = await adminSupabase
    .from("login_identities")
    .insert({
      user_id: data.user.id,
      login_id: userId,
      email,
    });

  if (identityError) {
    await adminSupabase.from("users").delete().eq("id", data.user.id);
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    console.error("Login identity creation failed", {
      code: identityError.code,
      message: identityError.message,
    });
    return { error: "新規登録に失敗しました" };
  }

  redirect("/account/register/check-email");
}

export async function requestPasswordResetAction(
  _previousState: EmailActionState,
  formData: FormData
): Promise<EmailActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "正しいメールアドレスを入力してください" };
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return { error: "Supabaseへ接続できません" };
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });
  return { success: "登録されている場合は、パスワード再設定メールを送信しました。" };
}

export async function updatePasswordAction(
  _previousState: EmailActionState,
  formData: FormData
): Promise<EmailActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) return { error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください` };
  if (password !== confirmation) return { error: "確認用パスワードが一致しません" };
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return { error: "Supabaseへ接続できません" };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "パスワードを更新できませんでした。再設定メールをもう一度送信してください。" };
  return { success: "パスワードを更新しました。" };
}

export async function requestEmailChangeAction(
  _previousState: EmailActionState,
  formData: FormData
): Promise<EmailActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "正しいメールアドレスを入力してください" };
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return { error: "Supabaseへ接続できません" };
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログイン情報を確認できませんでした" };

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${origin}/auth/callback?next=/account` }
  );
  if (error) {
    console.error("Email update failed", { code: error.code, message: error.message });
    return { error: emailErrorMessage(error.message) };
  }
  return { success: "確認メールを送信しました。メール内のリンクを開いて変更を完了してください。" };
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
