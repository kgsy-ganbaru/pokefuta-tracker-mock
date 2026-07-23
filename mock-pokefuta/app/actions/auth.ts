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

export type ChangePasswordState = {
  error?: string;
  success?: boolean;
};

export type UpdateProfileState = {
  error?: string;
  success?: boolean;
  nickname?: string;
  comment?: string;
  friendCode?: string;
};

const MIN_PASSWORD_LENGTH = 8;
const MIN_USER_ID_LENGTH = 3;
const MAX_USER_ID_LENGTH = 20;
const MAX_NICKNAME_LENGTH = 50;
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

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !password) {
    return { error: "利用者IDとパスワードを入力してください" };
  }
  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "ログインできませんでした。時間をおいて再度お試しください。" };
  }
  const email = await resolveEmailForLogin(userId);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "利用者IDまたはパスワードが違います" };
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
    return { error: "ログアウトできませんでした。時間をおいて再度お試しください。" };
  }
  await supabase.auth.signOut();
  redirect("/account");
}

export async function changePasswordAction(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("passwordConfirmation") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) return { error: `パスワードは${MIN_PASSWORD_LENGTH}文字以上で入力してください` };
  if (password !== confirmation) return { error: "確認用パスワードが一致しません" };

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) return { error: "認証設定を確認してください" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "ログインしてください" };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "パスワードを変更できませんでした" };
  const admin = createAdminClient();
  if (admin) await admin.from("users").update({ must_change_password: false, updated_at: new Date().toISOString() }).eq("id", user.id);
  return { success: true };
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!userId || !nickname || !inviteCode || !password || !passwordConfirmation) {
    return { error: "すべての項目を入力してください" };
  }
  const configuredInviteCode = process.env.REGISTRATION_INVITE_CODE?.trim();
  if (!configuredInviteCode) {
    console.error("Invite signup configuration is missing", {
      missing: "REGISTRATION_INVITE_CODE",
    });
    return { error: "現在、新規登録を受け付けていません。管理者へ連絡してください" };
  }
  if (inviteCode !== configuredInviteCode) {
    return { error: "招待コードが違います" };
  }
  if (userId.length > MAX_USER_ID_LENGTH) {
    return { error: `利用者IDは${MAX_USER_ID_LENGTH}文字以内で入力してください` };
  }
  if (!new RegExp(`^[a-z0-9_-]{${MIN_USER_ID_LENGTH},${MAX_USER_ID_LENGTH}}$`).test(userId)) {
    return {
      error: `利用者IDは${MIN_USER_ID_LENGTH}〜${MAX_USER_ID_LENGTH}文字の半角英小文字・数字・「-」「_」で入力してください`,
    };
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

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "新規登録を開始できませんでした。管理者へ連絡してください。" };
  }

  const admin = createAdminClient();
  if (!admin) {
    console.error("Invite signup configuration is missing", {
      missing: "SUPABASE_SERVICE_ROLE_KEY",
    });
    return { error: "現在、新規登録を受け付けていません。管理者へ連絡してください" };
  }

  const { data: existingIdentity, error: existingError } = await admin
    .from("login_identities")
    .select("user_id")
    .eq("login_id", userId)
    .maybeSingle();

  if (existingError) {
    return { error: "利用者IDの確認に失敗しました" };
  }

  if (existingIdentity) {
    return { error: "この利用者IDは既に使用されています" };
  }

  const email = userIdToEmail(userId);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nickname,
      user_id: userId,
      profile_managed_by_db: true,
    },
  });

  if (error || !data.user) {
    const message = error?.message ?? "Unknown signup error";
    if (
      error?.code === "user_already_exists" ||
      error?.code === "23505" ||
      message.includes("already registered") ||
      message.includes("duplicate key")
    ) {
      return { error: "この利用者IDは既に使用されています" };
    }
    console.error("Invite signup failed", {
      code: error?.code,
      status: error?.status,
      message,
    });
    return { error: "新規登録に失敗しました。管理者へ連絡してください" };
  }
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    await admin.auth.admin.deleteUser(data.user.id);
    console.error("Sign in after invite signup failed", {
      code: signInError.code,
      status: signInError.status,
      message: signInError.message,
    });
    return { error: "登録を完了できませんでした。もう一度お試しください" };
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
    return { error: "プロフィールを更新できませんでした。時間をおいて再度お試しください。" };
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
