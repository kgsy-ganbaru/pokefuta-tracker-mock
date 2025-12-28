"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

export default function AccountPage() {
  const { user, isLoggedIn, login, logout } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "ログイン失敗");
      return;
    }

    // ★ ここが重要：Context用に形をそろえる
    login({
      id: data.id,
      userId: data.username, // ← username → userId に変換
      nickname: data.nickname,
    });
  };

  /* =====================
     ログイン中表示
  ===================== */
  if (isLoggedIn && user) {
    return (
      <main className="max-w-md mx-auto p-6">
        <h2 className="text-lg font-semibold mb-4">
          アカウント
        </h2>

        <p className="mb-1">
          ニックネーム：{user.nickname}
        </p>
        <p className="text-sm text-gray-500">
          ユーザーID：{user.userId}
        </p>

        <button
          onClick={logout}
          className="mt-6 w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          ログアウト
        </button>
      </main>
    );
  }

  /* =====================
     ゲスト表示（ログイン）
  ===================== */
  return (
    <main className="max-w-md mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">
        ゲスト
      </h2>

      <input
        placeholder="ユーザーID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-2"
      />

      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-2"
      />

      {error && (
        <p className="text-sm text-red-600 mb-2">
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        ログイン
      </button>

      <button
        onClick={() => alert("新規登録は次に実装")}
        className="w-full mt-2 py-2 rounded border hover:bg-gray-50"
      >
        新規登録
      </button>
    </main>
  );
}
