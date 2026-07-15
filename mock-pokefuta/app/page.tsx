import HomeClient from "./components/HomeClient";
import {
  fetchPokefutaRows,
  fetchRecentRows,
  fetchBoardChanceIds,
} from "./lib/pokefuta/listData";
import { getAuthProfile } from "./lib/supabase/auth";
import { createClient } from "./lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);

  if (!supabase) {
    return <HomeClient recentRows={[]} pokefutaRows={[]} boardChanceIds={[]} />;
  }

  const recentRows = await fetchRecentRows(supabase);
  const pokefutaRows = await fetchPokefutaRows(
    supabase,
    user?.id ?? null
  );
  const boardChanceIds = await fetchBoardChanceIds(supabase);

  return (
    <HomeClient
      recentRows={recentRows}
      pokefutaRows={pokefutaRows}
      boardChanceIds={boardChanceIds}
    />
  );
}
