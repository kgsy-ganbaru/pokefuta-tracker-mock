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
    <div style={{ padding: "12px" }}>
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
        最近ゲット
      </div>

      <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              minWidth: "120px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px",
              textAlign: "center",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f0f0f0",
                margin: "0 auto 4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              No Image
            </div>

            <div>{item.pokemonNames.join(" / ")}</div>
            <div style={{ color: "#666" }}>
              {item.nickname} {item.count}枚
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
