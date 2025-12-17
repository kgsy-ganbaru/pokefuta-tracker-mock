import { pokefutaList } from "./data/pokefuta";
import { ownershipMap } from "./data/ownership";
import { recentGets } from "./data/recent";

import PokefutaRow from "./components/PokefutaRow";
import RecentGets from "./components/RecentGets";
import RegionTabs from "./components/RegionTabs";

export default function Home() {
  return (
    <main>
      {/* ① 最近ゲット（スクロールすると消える） */}
      <RecentGets items={recentGets} />

      {/* ② 地域タブ（スクロールしても残る） */}
      <RegionTabs />

      {/* ③ ポケふた一覧 */}
      {pokefutaList.map((p) => (
        <PokefutaRow
          key={p.id}
          pokemonNames={p.pokemonNames}
          address={p.address}
          owners={ownershipMap[p.id] ?? []}
        />
      ))}
    </main>
  );
}
