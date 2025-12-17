"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { pokefutaList } from "../../data/pokefuta";

export default function EditPage() {
  const params = useSearchParams();
  const router = useRouter();
  const id = Number(params.get("id"));

  const pokefuta = pokefutaList.find((p) => p.id === id);
  const [count, setCount] = useState(0);

  if (!pokefuta) return null;

  return (
    <main style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: "16px" }}>
        {pokefuta.pokemonNames.join(" / ")}
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setCount(Math.max(0, count - 1))}
        >
          −
        </button>

        <div style={{ fontSize: "24px" }}>{count} 枚</div>

        <button onClick={() => setCount(count + 1)}>＋</button>
      </div>

      <button
        onClick={() => {
          if (confirm("更新しますか？")) {
            alert("更新しました（モック）");
            router.back();
          }
        }}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          fontSize: "16px",
        }}
      >
        更新
      </button>
    </main>
  );
}
