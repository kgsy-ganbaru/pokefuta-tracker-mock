import Image from "next/image";
import Link from "next/link";
import MobileActionBar from "../components/MobileActionBar";
import { getCachedAuthProfile } from "../lib/supabase/auth";
import { createClient } from "../lib/supabase/server";
import BoardListClient, { BoardThreadWithMatch } from "./BoardListClient";
import { fetchBoardThreads } from "./boardData";
import { boardThreads, isThreadActive } from "./mockThreads";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const supabase = await createClient();
  const user = await getCachedAuthProfile();
  const [activeThreads, ownershipResult] = supabase
    ? await Promise.all([
        fetchBoardThreads(supabase, user?.id ?? null),
        user
          ? supabase.from("ownership").select("pokefuta_id").eq("user_id", user.id).gt("count", 0)
          : Promise.resolve({ data: [] as { pokefuta_id: number }[] }),
      ])
    : [boardThreads.filter(isThreadActive), { data: [] as { pokefuta_id: number }[] }];
  const ownedIds = new Set((ownershipResult.data ?? []).map((row) => String(row.pokefuta_id)));

  const threads: BoardThreadWithMatch[] = activeThreads.map((thread) => ({
    ...thread,
    exchangePossible: Boolean(user) && thread.offers.some((item) => !ownedIds.has(String(item.id))) && thread.wants.some((item) => ownedIds.has(String(item.id))),
  }));

  return (
    <>
      <main className="mx-auto max-w-3xl space-y-4 p-4 pb-40 sm:p-6 sm:pb-36">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Image src="/status-any-owned-pokeball.svg" alt="" width={20} height={20} />
          <span>掲示板</span>
          <Image src="/status-any-owned-pokeball.svg" alt="" width={20} height={20} />
        </h1>
        <BoardListClient threads={threads} isLoggedIn={Boolean(user)} />
      </main>
      <MobileActionBar>
        <Link href="/board/new" className="pft-primary-button w-full max-w-sm rounded-full px-6 py-3 text-center text-sm font-semibold">新しく投稿する</Link>
      </MobileActionBar>
    </>
  );
}
