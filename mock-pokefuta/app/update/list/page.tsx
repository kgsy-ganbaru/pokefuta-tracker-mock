"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { pokefutaList } from "../../data/pokefuta";

export default function UpdateListPage() {
  const router = useRouter();
  const params = useSearchParams();
  const prefecture = params.get("prefecture");

  const list = pokefutaList.filter(
    (p) => p.prefecture === prefecture
  );

  return (
    <main style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: "12px" }}>
        {prefecture} のポケふた
      </h2>

      {list.length === 0 ? (
  <div style={{ color: "#999" }}>
    この都道府県のポケふたはまだ登録されていません
  </div>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    }}
  >
    {list.map((p) => (
      <div
        key={p.id}
        onClick={() => router.push(`/update/edit?id=${p.id}`)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "12px",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "#f0f0f0",
            margin: "0 auto 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
          }}
        >
          No Image
        </div>

        <div style={{ textAlign: "center", fontWeight: "bold" }}>
          {p.pokemonNames.join(" / ")}
        </div>
      </div>
    ))}
  </div>
)}

    </main>
  );
}
