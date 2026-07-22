import "server-only";

import { redirect } from "next/navigation";
import { getAuthProfile } from "./supabase/auth";
import { createAdminClient, createClient } from "./supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);
  if (!user) redirect("/account");
  if (!user.is_admin || !user.is_active) redirect("/");

  const admin = createAdminClient();
  if (!admin) redirect("/account?authError=admin-config");
  return { admin, user };
}

export async function writeAdminAuditLog(
  adminUserId: string,
  action: string,
  targetType: string,
  targetId?: string | number | null,
  details: Record<string, unknown> = {}
) {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("admin_audit_logs").insert({
    admin_user_id: adminUserId,
    action,
    target_type: targetType,
    target_id: targetId == null ? null : String(targetId),
    details,
  });
  if (error) console.error("Failed to write admin audit log", error);
}

