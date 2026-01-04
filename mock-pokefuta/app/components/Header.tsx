"use client";

import { useRouter, usePathname } from "next/navigation";

type HeaderUser = {
  nickname: string;
} | null;

export default function Header({ user }: { user: HeaderUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <header className="border-b bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* =====================
            タイトル
        ===================== */}
        <h1
          onClick={() => router.push("/")}
          className="text-lg font-semibold text-gray-800 cursor-pointer"
        >
          Pokefuta Tracker
        </h1>

        {/* =====================
            右側メニュー
        ===================== */}
        <div className="flex items-center gap-4">
          {/* ホーム */}
          <button
            onClick={() => router.push("/")}
            className={`flex flex-col items-center text-[10px] font-medium transition ${
              isHome ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <span className="text-2xl">🏠</span>
            <span>ホーム</span>
          </button>

          {/* ユーザ一覧（将来追加予定） */}
          <button
            type="button"
            className="flex flex-col items-center text-[10px] font-medium text-gray-600 hover:text-blue-600"
          >
            <span className="text-2xl">👥</span>
            <span>ユーザ一覧</span>
          </button>

          {/* 掲示板（将来追加予定） */}
          <button
            type="button"
            className="flex flex-col items-center text-[10px] font-medium text-gray-600 hover:text-blue-600"
          >
            <span className="text-2xl">🪧</span>
            <span>掲示板</span>
          </button>

          {/* =====================
              アカウントボタン
          ===================== */}
          <button
            onClick={() => router.push("/account")}
            className="flex flex-col items-center text-[10px] font-medium text-gray-700 hover:text-blue-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-lg">
              👤
            </span>
            <span>{user ? user.nickname : "ゲスト"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
