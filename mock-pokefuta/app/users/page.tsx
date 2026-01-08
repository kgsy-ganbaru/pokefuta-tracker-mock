import UsersListClient, { type UserListItem } from "./UsersListClient";
import { getAuthProfile } from "../lib/supabase/auth";
import { createClient } from "../lib/supabase/server";
type UserRow = {
  id: string;
  user_id: string | null;
  nickname: string | null;
  created_at: string | null;
};

type OwnershipRow = {
  user_id: string;
  count: number;
};

export default async function UsersPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <UsersListClient users={[]} isReady={false} />
      </main>
    );
  }

  const [
    { data: usersData },
    { data: ownershipData },
    authProfile,
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, user_id, nickname, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("ownership").select("user_id, count"),
    getAuthProfile(supabase),
  ]);

  const ownershipMap = new Map<string, number>();
  (ownershipData ?? []).forEach((row: OwnershipRow) => {
    ownershipMap.set(
      row.user_id,
      (ownershipMap.get(row.user_id) ?? 0) + 1
    );
  });

  const users: UserListItem[] = (usersData ?? []).map((row: UserRow) => {
    const ownershipKey = row.id;
    return {
      id: row.id,
      name: row.nickname ?? row.user_id ?? "未設定",
      pokefutaCount: ownershipMap.get(ownershipKey) ?? 0,
      registeredAt: row.created_at ?? "",
    };
  });

  const currentUser =
    authProfile &&
    (users.find((user) => user.id === authProfile.id) ?? {
      id: authProfile.id,
      name: authProfile.nickname || authProfile.user_id || "未設定",
      pokefutaCount: ownershipMap.get(authProfile.id) ?? 0,
      registeredAt: "",
    });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <UsersListClient users={users} isReady currentUser={currentUser} />
    </main>
  );
}
