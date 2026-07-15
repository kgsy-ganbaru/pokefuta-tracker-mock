import { notFound } from "next/navigation";
import { fetchPokefutaRows } from "../../../lib/pokefuta/listData";
import { getAuthProfile } from "../../../lib/supabase/auth";
import { createClient } from "../../../lib/supabase/server";
import { fetchBoardThreads } from "../../boardData";
import { boardThreads } from "../../mockThreads";
import BoardPostEditClient from "./BoardPostEditClient";

export const dynamic = "force-dynamic";
export default async function BoardPostEditPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);
  if (supabase) {
    if (!user) notFound();
    const thread = (await fetchBoardThreads(supabase, user.id, { includeClosed: true, threadId }))[0];
    if (!thread?.isMine) notFound();
    const rows = await fetchPokefutaRows(supabase, user.id);
    return <BoardPostEditClient threadId={thread.id} rows={rows} initialOffers={thread.offers.map((item) => Number(item.id))} initialWants={thread.wants.map((item) => Number(item.id))} dataBacked />;
  }
  const thread = boardThreads.find((item) => item.id === threadId);
  if (!thread?.isMine) notFound();
  return <BoardPostEditClient threadId={thread.id} rows={[]} initialOffers={[]} initialWants={[]} />;
}
