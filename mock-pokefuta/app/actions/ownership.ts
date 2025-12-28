"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { getAuthProfile } from "../lib/supabase/auth";

export type OwnershipState = {
  error?: string;
  success?: boolean;
};

export async function updateOwnershipAction(
  _prevState: OwnershipState,
  formData: FormData
): Promise<OwnershipState> {
  const pokefutaId = Number(formData.get("pokefutaId"));
  const count = Number(formData.get("count"));

  if (!Number.isFinite(pokefutaId)) {
    return { error: "不正なポケふたIDです" };
  }

  const supabase = createClient();
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const user = await getAuthProfile(supabase);
  if (!user) {
    return { error: "ポケふたを登録するにはログインが必要です" };
  }

  if (count <= 0) {
    const { error } = await supabase
      .from("ownership")
      .delete()
      .eq("user_id", user.id)
      .eq("pokefuta_id", pokefutaId);

    if (error) {
      return { error: "更新に失敗しました" };
    }

    revalidatePath(`/pokefuta/${pokefutaId}`);
    revalidatePath("/");
    return { success: true };
  }

  const { error } = await supabase.from("ownership").upsert(
    {
      user_id: user.id,
      pokefuta_id: pokefutaId,
      count,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,pokefuta_id" }
  );

  if (error) {
    return { error: "更新に失敗しました" };
  }

  revalidatePath(`/pokefuta/${pokefutaId}`);
  revalidatePath("/");
  return { success: true };
}