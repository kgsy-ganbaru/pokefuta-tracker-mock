import BulkRegisterClient from "./BulkRegisterClient";
import { fetchPokefutaRows } from "../lib/pokefuta/listData";
import { getAuthProfile } from "../lib/supabase/auth";
import { createClient } from "../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = await createClient();
  const user = await getAuthProfile(supabase);

  if (!supabase) {
    return (
      <BulkRegisterClient pokefutaRows={[]} isLoggedIn={false} />
    );
  }

  const pokefutaRows = await fetchPokefutaRows(
    supabase,
    user?.id ?? null
  );

  return (
    <BulkRegisterClient
      pokefutaRows={pokefutaRows}
      isLoggedIn={!!user}
    />
  );
}
