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
      style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      {/* No Image */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: "#666",
          flexShrink: 0,
        }}
      >
        No Image
      </div>

      {/* 情報 */}
      <div>
        <div style={{ fontWeight: "bold" }}>
          {pokemonNames.join(" / ")}
        </div>
        <div style={{ fontSize: "12px", color: "#555" }}>{address}</div>

        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          {owners.length === 0 ? (
            <span style={{ color: "#999" }}>（未取得）</span>
          ) : (
            owners.map((o) => (
              <span key={o.nickname} style={{ marginRight: "8px" }}>
                {o.nickname} {o.count}枚
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
