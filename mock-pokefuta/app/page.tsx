// app/page.tsx
import HomeClient from "./components/HomeClient";
import { pool } from "./lib/db";

export default async function HomePage() {
  // =====================
  // DB 接続テスト（Server only）
  // =====================
  try {
    const res = await pool.query("SELECT 1");
    console.log("DB接続OK:", res.rows);
  } catch (err) {
    console.error("DB接続エラー:", err);
  }

  // =====================
  // 画面は Client Component に委譲
  // =====================
  return <HomeClient />;
}
