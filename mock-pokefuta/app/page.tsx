import HomeClient from "./components/HomeClient";
import {
  fetchPokefutaRows,
  fetchRecentRows,
  fetchBoardChanceIds,
} from "./lib/pokefuta/listData";
import { createClient } from "./lib/supabase/server";
import { getCachedAuthUser } from "./lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();

  if (!supabase) {
    return <HomeClient recentRows={[]} pokefutaRows={[]} boardChanceIds={[]} />;
  }

  const user = await getCachedAuthUser();

  const [recentRows, pokefutaRows, boardChanceIds] = await Promise.all([
    fetchRecentRows(supabase),
    fetchPokefutaRows(supabase, user?.id ?? null),
    fetchBoardChanceIds(supabase),
  ]);

  return (
    <HomeClient
      recentRows={recentRows}
      pokefutaRows={pokefutaRows}
      boardChanceIds={boardChanceIds}
    />
  );
}
