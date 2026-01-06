export default function RecentGets({
  items,
}: {
  items: {
    id: number;
    pokemonNames: string[];
    nickname: string;
    count: number;
  }[];
}) {
  return (
    <div className="p-3">
      <div className="text-sm font-semibold mb-2 pft-section-title flex items-center justify-center gap-2">
        <img
          src="/status-any-owned-pokeball.svg"
          alt=""
          aria-hidden="true"
          className="w-3 h-3"
        />
        <span>最近ゲット</span>
        <img
          src="/status-any-owned-pokeball.svg"
          alt=""
          aria-hidden="true"
          className="w-3 h-3"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[96px] rounded-lg p-1.5 text-center text-[0.7rem] pft-card"
          >
            <div
              className="w-10 h-10 rounded-full pft-placeholder mx-auto mb-1 flex items-center justify-center text-[0.65rem]"
            >
              No Image
            </div>

            <div>{item.pokemonNames.join(" / ")}</div>
            <div className="pft-muted">
              {item.nickname} {item.count}枚
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
