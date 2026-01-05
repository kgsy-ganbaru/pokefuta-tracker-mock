type Owner = {
  nickname: string;
  count: number;
};

type Props = {
  pokemonNames: string[];
  address: string;
  owners: Owner[];
};

export default function PokefutaRow({
  pokemonNames,
  address,
  owners,
}: Props) {
  return (
    <div
      className="flex gap-3 p-3 pft-row"
    >
      {/* No Image */}
      <div
        className="w-12 h-12 rounded-full pft-placeholder flex items-center justify-center text-xs flex-shrink-0"
      >
        No Image
      </div>

      {/* 情報 */}
      <div>
        <div className="font-semibold">
          {pokemonNames.join(" / ")}
        </div>
        <div className="text-xs pft-muted">{address}</div>

        <div className="text-xs mt-1">
          {owners.length === 0 ? (
            <span className="text-xs text-gray-400">（未取得）</span>
          ) : (
            owners.map((o) => (
              <span key={o.nickname} className="mr-2">
                {o.nickname} {o.count}枚
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
