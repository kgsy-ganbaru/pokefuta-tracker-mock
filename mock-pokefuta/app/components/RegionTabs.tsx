export default function RegionTabs() {
  const regions = [
    "北海道・東北",
    "関東",
    "中部",
    "近畿",
    "中国・四国",
    "九州・沖縄",
  ];

  return (
    <div
      className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b p-2 pft-tabbar"
    >
      {regions.map((r) => (
        <button
          key={r}
          className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap pft-chip"
        >
          {r}
        </button>
      ))}
    </div>
  );
}
