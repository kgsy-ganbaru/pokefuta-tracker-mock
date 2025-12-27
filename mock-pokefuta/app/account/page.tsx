"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  // 仮ログイン（あとでDBに差し替える）
  const handleLogin = () => {
    if (!userId || !password) {
      alert("ユーザーIDとパスワードを入力してください");
      return;
    }

    // TODO: DB認証に置き換える
    login({
      id: 1,
      nickname: userId,
    });

    router.push("/");
  };

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      <h2 className="text-lg font-semibold mb-6">アカウント</h2>

      {/* ログイン中 */}
      {user ? (
        <div className="space-y-4">
          <p>
            ログイン中ユーザー：
            <strong className="ml-2">{user.nickname}</strong>
          </p>

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full py-2 rounded bg-gray-200"
          >
            ログアウト
          </button>
        </div>
      ) : (
        /* ゲスト */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            現在はゲストとして閲覧しています
          </p>

          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ユーザーID"
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="w-full border px-3 py-2 rounded"
          />

          <button
            onClick={handleLogin}
            className="w-full py-2 rounded bg-blue-600 text-white"
          >
            ログイン
          </button>
            <p className="text-sm text-blue-600 mb-2">
              はじめての方はこちら
            </p>
          <button
            onClick={() => router.push("/account/register")}
            className="w-full py-2 rounded border"
            
          >
            新規登録
          </button>
        </div>
      )}
    </main>
  );
}
