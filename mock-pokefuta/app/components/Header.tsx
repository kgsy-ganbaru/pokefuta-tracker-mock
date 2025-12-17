"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "16px",
        padding: "12px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <button
        onClick={() => router.push("/update")}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #999",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        登録・削除
      </button>

      <button
        onClick={() => router.push("/")}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #999",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        登録状況
      </button>
    </header>
  );
}
