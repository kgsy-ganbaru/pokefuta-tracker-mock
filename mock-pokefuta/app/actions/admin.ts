"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, writeAdminAuditLog } from "../lib/admin";

const STORAGE_BUCKET = "pokefuta";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function adminUsersRedirect(type: "message" | "error", message: string): never {
  redirect(`/admin/users?${type}=${encodeURIComponent(message)}`);
}

function parsePokemonNames(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/[、,\n/]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function regionForPrefecture(prefectureId: number) {
  if (prefectureId <= 7) return 1;
  if (prefectureId <= 14) return 2;
  if (prefectureId <= 23) return 3;
  if (prefectureId <= 30) return 4;
  if (prefectureId <= 39) return 5;
  if (prefectureId <= 47) return 6;
  return null;
}

async function uploadPokefutaImage(
  file: File,
  pokefutaId: number,
  admin: Awaited<ReturnType<typeof requireAdmin>>["admin"]
) {
  if (!file.size) return null;
  if (!file.type.startsWith("image/")) throw new Error("画像ファイルを選択してください");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("画像は5MB以内にしてください");
  const extension = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${pokefutaId}.${extension}`;
  const { error } = await admin.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });
  if (error) throw new Error(`画像を保存できませんでした: ${error.message}`);
  return admin.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function resetUserPasswordAction(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!targetUserId || password.length < 8) adminUsersRedirect("error", "仮パスワードは8文字以上で入力してください");

  const { error } = await admin.auth.admin.updateUserById(targetUserId, { password });
  if (error) adminUsersRedirect("error", "パスワードを更新できませんでした");
  await admin.from("users").update({ must_change_password: true, updated_at: new Date().toISOString() }).eq("id", targetUserId);
  await writeAdminAuditLog(user.id, "password_reset", "user", targetUserId);
  revalidatePath("/admin/users");
  adminUsersRedirect("message", "仮パスワードを設定しました");
}

export async function toggleUserActiveAction(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const nextActive = String(formData.get("nextActive")) === "true";
  if (targetUserId === user.id && !nextActive) adminUsersRedirect("error", "自分のアカウントは停止できません");

  const { error: authError } = await admin.auth.admin.updateUserById(targetUserId, {
    ban_duration: nextActive ? "none" : "876000h",
  });
  if (authError) adminUsersRedirect("error", "利用状態を変更できませんでした");
  const { error } = await admin.from("users").update({ is_active: nextActive, updated_at: new Date().toISOString() }).eq("id", targetUserId);
  if (error) adminUsersRedirect("error", "利用状態を保存できませんでした");
  await writeAdminAuditLog(user.id, nextActive ? "user_reactivated" : "user_suspended", "user", targetUserId);
  revalidatePath("/admin/users");
  adminUsersRedirect("message", nextActive ? "アカウントを再開しました" : "アカウントを停止しました");
}

export async function toggleUserAdminAction(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const nextAdmin = String(formData.get("nextAdmin")) === "true";
  if (targetUserId === user.id && !nextAdmin) adminUsersRedirect("error", "自分自身の管理者権限は解除できません");
  if (!nextAdmin) {
    const { count } = await admin.from("users").select("id", { count: "exact", head: true }).eq("is_admin", true).eq("is_active", true);
    if ((count ?? 0) <= 1) adminUsersRedirect("error", "最後の管理者は解除できません");
  }
  const { error } = await admin.from("users").update({ is_admin: nextAdmin, updated_at: new Date().toISOString() }).eq("id", targetUserId);
  if (error) adminUsersRedirect("error", "管理者権限を変更できませんでした");
  await writeAdminAuditLog(user.id, nextAdmin ? "admin_granted" : "admin_revoked", "user", targetUserId);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  adminUsersRedirect("message", nextAdmin ? "管理者に設定しました" : "管理者権限を解除しました");
}

export type AdminPokefutaState = { error?: string; success?: boolean };

type DatabaseError = {
  code?: string;
  message?: string;
};

function pokefutaSaveErrorMessage(error: unknown) {
  const databaseError = error as DatabaseError;
  if (databaseError.code === "23505" && databaseError.message?.includes("pokefuta_pkey")) {
    return "登録番号が重複しました。管理者にデータベースの採番確認を依頼してください";
  }
  if (error instanceof Error) return error.message;
  if (databaseError.message) return `ポケふたを保存できませんでした: ${databaseError.message}`;
  return "ポケふたを保存できませんでした";
}

export async function savePokefutaAction(_state: AdminPokefutaState, formData: FormData): Promise<AdminPokefutaState> {
  const { admin, user } = await requireAdmin();
  const idValue = String(formData.get("pokefutaId") ?? "");
  const existingId = idValue ? Number(idValue) : null;
  const regionId = Number(formData.get("regionId"));
  const prefectureId = Number(formData.get("prefectureId"));
  const cityName = String(formData.get("cityName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const pokemonNames = parsePokemonNames(formData.get("pokemonNames"));
  const image = formData.get("image");
  if (!Number.isInteger(regionId) || !Number.isInteger(prefectureId) || regionForPrefecture(prefectureId) !== regionId || !cityName || !address || pokemonNames.length === 0) {
    return { error: "都道府県、市区町村、住所、ポケモン名を入力してください" };
  }
  if (!existingId && (!(image instanceof File) || image.size === 0)) return { error: "画像を選択してください" };

  let pokefutaId = existingId;
  try {
    if (existingId) {
      const { error } = await admin.from("pokefuta").update({ region_id: regionId, prefecture_id: prefectureId, city_name: cityName, address, updated_at: new Date().toISOString() }).eq("id", existingId);
      if (error) throw error;
    } else {
      const { data: orderRow } = await admin.from("pokefuta").select("prefecture_order").eq("prefecture_id", prefectureId).order("prefecture_order", { ascending: false }).limit(1).maybeSingle();
      const { data, error } = await admin.from("pokefuta").insert({ region_id: regionId, prefecture_id: prefectureId, prefecture_order: Number(orderRow?.prefecture_order ?? 0) + 1, city_name: cityName, address, difficulty_code: "I", is_active: true }).select("id").single();
      if (error || !data) throw error ?? new Error("登録できませんでした");
      pokefutaId = Number(data.id);
    }

    if (image instanceof File && image.size > 0) {
      const imageUrl = await uploadPokefutaImage(image, pokefutaId!, admin);
      const { error: imageUrlError } = await admin.from("pokefuta").update({ image_url: imageUrl, updated_at: new Date().toISOString() }).eq("id", pokefutaId!);
      if (imageUrlError) throw imageUrlError;
    }
    await admin.from("pokefuta_pokemon").delete().eq("pokefuta_id", pokefutaId!);
    const { error: pokemonError } = await admin.from("pokefuta_pokemon").insert(pokemonNames.map((pokemonName, index) => ({ pokefuta_id: pokefutaId, pokemon_name: pokemonName, display_order: index + 1 })));
    if (pokemonError) throw pokemonError;
    await writeAdminAuditLog(user.id, existingId ? "pokefuta_updated" : "pokefuta_created", "pokefuta", pokefutaId, { city_name: cityName });
  } catch (error) {
    console.error("Admin pokefuta save failed", error);
    return { error: pokefutaSaveErrorMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/bulk");
  revalidatePath("/board");
  revalidatePath("/admin/pokefuta");
  redirect(`/admin/pokefuta?message=${encodeURIComponent(existingId ? "更新しました" : "登録しました")}`);
}

export async function togglePokefutaActiveAction(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const pokefutaId = Number(formData.get("pokefutaId"));
  const nextActive = String(formData.get("nextActive")) === "true";
  if (!Number.isInteger(pokefutaId)) redirect("/admin/pokefuta?error=対象が不正です");
  const { error } = await admin.from("pokefuta").update({ is_active: nextActive, updated_at: new Date().toISOString() }).eq("id", pokefutaId);
  if (error) redirect(`/admin/pokefuta?error=${encodeURIComponent("公開状態を変更できませんでした")}`);
  await writeAdminAuditLog(user.id, nextActive ? "pokefuta_published" : "pokefuta_hidden", "pokefuta", pokefutaId);
  revalidatePath("/");
  revalidatePath("/admin/pokefuta");
  redirect(`/admin/pokefuta?message=${encodeURIComponent(nextActive ? "公開しました" : "非公開にしました")}`);
}
