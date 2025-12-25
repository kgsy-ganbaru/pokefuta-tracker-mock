import { Pool } from "pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4, // IPv4強制（実行時は有効）
} as any);
