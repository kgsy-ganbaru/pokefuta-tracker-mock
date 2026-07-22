import { createClient } from "@supabase/supabase-js";

const [userId, newPassword] = process.argv.slice(2);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;

if (!userId || !newPassword) {
  console.error("使い方: npm run auth:reset-password -- <ユーザID> <新しいパスワード>");
  process.exit(1);
}

if (newPassword.length < 8) {
  console.error("新しいパスワードは8文字以上にしてください。");
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を環境変数に設定してください。"
  );
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: identity, error: identityError } = await admin
  .from("login_identities")
  .select("auth_user_id")
  .eq("login_id", userId.trim())
  .maybeSingle();

if (identityError) {
  console.error(`ユーザーの検索に失敗しました: ${identityError.message}`);
  process.exit(1);
}

if (!identity?.auth_user_id) {
  console.error("指定したユーザIDは見つかりませんでした。");
  process.exit(1);
}

const { error: updateError } = await admin.auth.admin.updateUserById(
  identity.auth_user_id,
  { password: newPassword }
);

if (updateError) {
  console.error(`パスワードの更新に失敗しました: ${updateError.message}`);
  process.exit(1);
}

console.log(`ユーザID「${userId.trim()}」のパスワードを更新しました。`);
