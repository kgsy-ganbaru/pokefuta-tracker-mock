import { notFound } from "next/navigation";
import { fetchPokefutaRows } from "../../../lib/pokefuta/listData";
import { getCachedAuthProfile } from "../../../lib/supabase/auth";
import { createClient } from "../../../lib/supabase/server";
import { fetchBoardThreads } from "../../boardData";
import { boardThreads } from "../../mockThreads";
import BoardPostEditClient from "./BoardPostEditClient";

export const dynamic = "force-dynamic";
export default async function BoardPostEditPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();
  const user = await getCachedAuthProfile();
  if (supabase) {
    if (!user) notFound();
    const [threads, rows] = await Promise.all([
      fetchBoardThreads(supabase, user.id, { includeClosed: true, threadId }),
      fetchPokefutaRows(supabase, user.id),
    ]);
    const thread = threads[0];
    if (!thread?.isMine) notFound();
    return <BoardPostEditClient threadId={thread.id} rows={rows} initialOffers={thread.offers.map((item) => Number(item.id))} initialWants={thread.wants.map((item) => Number(item.id))} dataBacked />;
  }
  const thread = boardThreads.find((item) => item.id === threadId);
  if (!thread?.isMine) notFound();
  return <BoardPostEditClient threadId={thread.id} rows={[]} initialOffers={[]} initialWants={[]} />;
}
