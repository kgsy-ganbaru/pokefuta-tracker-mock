export default function RegionTabs() {
  const regions = [
    "北海道・東北",
    "関東",
    "中部",
    "近畿",
    "中国・四国",
    "九州・沖縄",
    "その他",
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: "#fff",
        borderBottom: "1px solid #ddd",
        padding: "8px",
        zIndex: 10,
        display: "flex",
        gap: "8px",
        overflowX: "auto",
      }}
    >
      {regions.map((r) => (
        <button
          key={r}
          style={{
            padding: "6px 12px",
            borderRadius: "16px",
            border: "1px solid #999",
            background: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
