"use client";

import { useState } from "react";
import { prefecturesByRegion } from "../data/prefectures";
import PrefectureModal from "../components/PrefectureModal";

export default function UpdatePage() {
  const regions = Object.keys(prefecturesByRegion);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  

  return (
    <main style={{ padding: "16px" }}>
      <h2 style={{ marginBottom: "12px" }}>地域を選択</h2>

      <div style={{ display: "grid", gap: "12px" }}>
        {regions.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRegion(r)}
            style={{
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              background: "#fff",
              fontSize: "16px",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {selectedRegion && (
        <PrefectureModal
          region={selectedRegion}
          prefectures={prefecturesByRegion[selectedRegion]}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </main>
  );
}
