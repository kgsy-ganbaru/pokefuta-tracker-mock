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

const MIN_PASSWORD_LENGTH = 8;
const MAX_USER_ID_LENGTH = 50;
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
  const inviteCode = String(formData.get("inviteCode") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!userId || !nickname || !inviteCode || !password || !passwordConfirmation) {
    return { error: "すべての項目を入力してください" };
  }
  const configuredInviteCode = process.env.REGISTRATION_INVITE_CODE?.trim();
  if (!configuredInviteCode) {
    return { error: "現在、新規登録を受け付けていません。管理者へ連絡してください" };
  }
  if (inviteCode !== configuredInviteCode) {
    return { error: "招待コードが違います" };
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

  const email = userIdToEmail(userId);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        user_id: userId,
        profile_managed_by_db: true,
      },
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
      return { error: "このユーザIDは既に使用されています" };
    }
    console.error("Invite signup failed", {
      code: error?.code,
      status: error?.status,
      message,
    });
    return { error: "新規登録に失敗しました。管理者へ連絡してください" };
  }
  if (data.user.identities?.length === 0) {
    return { error: "このユーザIDは既に使用されています" };
  }

  if (!data.session) {
    return { error: "登録を完了できませんでした。管理者へ連絡してください" };
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
