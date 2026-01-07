"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { getAuthProfile } from "../lib/supabase/auth";

export type OwnershipState = {
  error?: string;
  success?: boolean;
};

export type BulkOwnershipState = {
  error?: string;
  success?: boolean;
};

export type BulkOwnershipSelection = {
  id: number;
  count: number;
};

type OwnershipRow = {
  count: number | string | null;
  last_get_at: string | null;
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

  const supabase = await createClient({ cookieMode: "read-write" });
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

  const { data: existingRow } = await supabase
    .from("ownership")
    .select("count, last_get_at")
    .eq("user_id", user.id)
    .eq("pokefuta_id", pokefutaId)
    .maybeSingle();

  const previousCount = Number(
    (existingRow as OwnershipRow | null)?.count ?? 0
  );
  const shouldUpdateLastGetAt =
    !Number.isFinite(previousCount) || count > previousCount;
  const lastGetAt =
    shouldUpdateLastGetAt
      ? new Date().toISOString()
      : (existingRow as OwnershipRow | null)?.last_get_at ?? null;

  const { error } = await supabase.from("ownership").upsert(
    {
      user_id: user.id,
      pokefuta_id: pokefutaId,
      count,
      updated_at: new Date().toISOString(),
      last_get_at: lastGetAt,
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

export async function bulkUpdateOwnershipAction(
  selections: BulkOwnershipSelection[]
): Promise<BulkOwnershipState> {
  if (!Array.isArray(selections)) {
    return { error: "更新対象が不正です" };
  }

  const supabase = await createClient({ cookieMode: "read-write" });
  if (!supabase) {
    return { error: "Supabase環境変数が設定されていません" };
  }

  const user = await getAuthProfile(supabase);
  if (!user) {
    return { error: "ポケふたを登録するにはログインが必要です" };
  }

  for (const selection of selections) {
    const pokefutaId = Number(selection.id);
    const count = Number(selection.count);
    if (!Number.isFinite(pokefutaId) || !Number.isFinite(count)) {
      return { error: "更新対象が不正です" };
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
    } else {
      const { data: existingRow } = await supabase
        .from("ownership")
        .select("count, last_get_at")
        .eq("user_id", user.id)
        .eq("pokefuta_id", pokefutaId)
        .maybeSingle();
      const previousCount = Number(
        (existingRow as OwnershipRow | null)?.count ?? 0
      );
      const shouldUpdateLastGetAt =
        !Number.isFinite(previousCount) || count > previousCount;
      const lastGetAt =
        shouldUpdateLastGetAt
          ? new Date().toISOString()
          : (existingRow as OwnershipRow | null)?.last_get_at ?? null;

      const { error } = await supabase.from("ownership").upsert(
        {
          user_id: user.id,
          pokefuta_id: pokefutaId,
          count,
          updated_at: new Date().toISOString(),
          last_get_at: lastGetAt,
        },
        { onConflict: "user_id,pokefuta_id" }
      );

      if (error) {
        return { error: "更新に失敗しました" };
      }
    }

    revalidatePath(`/pokefuta/${pokefutaId}`);
  }

  revalidatePath("/");
  return { success: true };
}
