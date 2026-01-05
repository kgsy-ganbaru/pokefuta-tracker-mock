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
      <div className="font-semibold mb-2 pft-section-title">
        最近ゲット
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="min-w-[120px] rounded-lg p-2 text-center text-xs pft-card"
          >
            <div
              className="w-12 h-12 rounded-full pft-placeholder mx-auto mb-1 flex items-center justify-center text-xs"
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
