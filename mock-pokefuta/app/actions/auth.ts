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
const MAX_USER_ID_LENGTH = 50;
const MAX_NICKNAME_LENGTH = 50;
const MAX_COMMENT_LENGTH = 200;
const FRIEND_CODE_LENGTH = 12;

type AuthErrorLike = {
  code?: string;
  message: string;
  status?: number;
};

async function getAuthRedirectOrigin() {
  const requestOrigin = (await headers()).get("origin");
  const candidates = [requestOrigin, process.env.NEXT_PUBLIC_SITE_URL];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || url.protocol === "http:") return url.origin;
    } catch {
      // Try the configured fallback when the request header is malformed.
    }
  }

  return null;
}

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

function isEmailRateLimitError(error: AuthErrorLike) {
  const normalized = `${error.code ?? ""} ${error.message}`.toLowerCase();
  return (
    error.status === 429 ||
    normalized.includes("rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  );
}

function emailDeliveryErrorMessage(error: AuthErrorLike) {
  const normalized = `${error.code ?? ""} ${error.message}`.toLowerCase();
  if (isEmailRateLimitError(error)) {
    return "確認メールの送信上限に達しました。時間をおいてからもう一度お試しください。";
  }
  if (
    normalized.includes("smtp") ||
    normalized.includes("email") ||
    normalized.includes("mail")
  ) {
    return "確認メールを送信できませんでした。時間をおいてからもう一度お試しください。";
  }
  return "新規登録に失敗しました。時間をおいてからもう一度お試しください。";
}

function emailChangeErrorMessage(error: AuthErrorLike) {
  const normalized = `${error.code ?? ""} ${error.message}`.toLowerCase();
  if (normalized.includes("already") || normalized.includes("exists") || normalized.includes("registered")) {
    return "このメールアドレスは既に使用されています。パスワード再設定をお試しください。";
  }
  if (isEmailRateLimitError(error)) {
    return "確認メールの送信上限に達しました。時間をおいてからもう一度お試しください。";
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
  if (userId.length > MAX_USER_ID_LENGTH) {
    return { error: `ユーザIDは${MAX_USER_ID_LENGTH}文字以内で入力してください` };
  }
  if (userId.includes("@") || /\s/.test(userId)) {
    return { error: "ユーザIDに空白や@は使用できません" };
  }
  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return { error: `ニックネームは${MAX_NICKNAME_LENGTH}文字以内で入力してください` };
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

  const origin = await getAuthRedirectOrigin();
  if (!origin) return { error: "認証用URLが設定されていません" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
      data: {
        nickname,
        user_id: userId,
        profile_managed_by_db: true,
      },
    },
  });

  if (error || !data.user) {
    const authError: AuthErrorLike = error ?? { message: "Unknown signup error" };
    const message = authError.message;
    if (
      authError.code === "user_already_exists" ||
      authError.code === "23505" ||
      message.includes("already registered") ||
      message.includes("duplicate key")
    ) {
      return { error: "このユーザIDまたはメールアドレスは既に使用されています" };
    }
    console.error("Email signup failed", {
      code: authError.code,
      status: authError.status,
      message,
    });
    return { error: emailDeliveryErrorMessage(authError) };
  }
  if (data.user.identities?.length === 0) {
    return { error: "このメールアドレスは既に使用されています。ログインまたはパスワード再設定をお試しください。" };
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
  const origin = await getAuthRedirectOrigin();
  if (!origin) return { error: "認証用URLが設定されていません" };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/account/reset-password`,
  });
  if (error && isEmailRateLimitError(error)) {
    return { error: "再設定メールの送信上限に達しました。時間をおいてからもう一度お試しください。" };
  }
  if (error) {
    console.error("Password reset email failed", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    return { error: "再設定メールを送信できませんでした。時間をおいてからもう一度お試しください。" };
  }
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
  const origin = await getAuthRedirectOrigin();
  if (!origin) return { error: "認証用URLが設定されていません" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログイン情報を確認できませんでした" };

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${origin}/auth/callback?next=/account` }
  );
  if (error) {
    console.error("Email update failed", { code: error.code, message: error.message });
    return { error: emailChangeErrorMessage(error) };
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
