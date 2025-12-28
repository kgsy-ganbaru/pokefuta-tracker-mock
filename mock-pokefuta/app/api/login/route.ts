import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/app/lib/db";

export async function POST(req: Request) {
  const { userId, password } = await req.json();

  if (!userId || !password) {
    return NextResponse.json(
      { error: "ユーザーIDとパスワードを入力してください" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `
    SELECT id, user_id, nickname, password_hash
    FROM users
    WHERE user_id = $1
    `,
    [userId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json(
      { error: "ユーザーIDまたはパスワードが違います" },
      { status: 401 }
    );
  }

  const user = result.rows[0];

  const ok = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!ok) {
    return NextResponse.json(
      { error: "ユーザーIDまたはパスワードが違います" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    id: user.id,
    userId: user.user_id,
    nickname: user.nickname,
  });
}
