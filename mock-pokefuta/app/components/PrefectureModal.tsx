"use client";

type Props = {
  region: string;
  prefectures: string[];
  onClose: () => void;
};

export default function PrefectureModal({
  region,
  prefectures,
  onClose,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "8px",
          width: "80%",
          maxWidth: "320px",
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "12px" }}>
          {region}
        </div>

        <div style={{ display: "grid", gap: "8px" }}>
          {prefectures.map((p) => (
            <button
              key={p}
              onClick={() => {
                window.location.href = `/update/list?prefecture=${p}`;
              }}

              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "8px",
            background: "#eee",
            borderRadius: "6px",
            border: "none",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
