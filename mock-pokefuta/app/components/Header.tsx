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
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          {/* 一覧 */}
          <button
            onClick={() => router.push("/")}
            className={`px-3 py-1.5 rounded-md text-sm transition
              ${
                isHome
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            一覧
          </button>

          {/* =====================
              アカウントボタン
          ===================== */}
          <button
            onClick={() => router.push("/account")}
            className="flex flex-col items-center text-sm"
          >
            <span className="text-xl">👤</span>
             <span className="text-xs">{user ? user.nickname : "ゲスト"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
