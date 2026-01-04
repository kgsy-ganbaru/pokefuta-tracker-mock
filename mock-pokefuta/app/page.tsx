import HomeClient from "./components/HomeClient";
import {
  fetchPokefutaRows,
  fetchRecentRows,
} from "./lib/pokefuta/listData";
import { getAuthProfile } from "./lib/supabase/auth";
import { createClient } from "./lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);

  if (!supabase) {
    return <HomeClient recentRows={[]} pokefutaRows={[]} />;
  }

  const recentRows = await fetchRecentRows(supabase);
  const pokefutaRows = await fetchPokefutaRows(
    supabase,
    user?.id ?? null
  );

  return (
    <HomeClient
      recentRows={recentRows}
      pokefutaRows={pokefutaRows}
    />
  );
}
