"use client";

import { useRouter, usePathname } from "next/navigation";

const iconClassName = "h-6 w-6";
const iconStrokeWidth = 1.5;

const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
);

const UsersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 11a3 3 0 1 0-6 0" />
    <path d="M8 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    <path d="M4 12a3 3 0 1 0 6 0" />
    <path d="M2 21v-1a4 4 0 0 1 4-4" />
  </svg>
);

const BoardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className={iconClassName}
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
    <rect x="3" y="4" width="18" height="16" rx="2" />
  </svg>
);

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={iconStrokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </svg>
);

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
            <span className="text-current">
              <HomeIcon />
            </span>
            <span>ホーム</span>
          </button>

          {/* ユーザ一覧（将来追加予定） */}
          <button
            type="button"
            className="flex flex-col items-center text-[10px] font-medium text-gray-600 hover:text-blue-600"
          >
            <span className="text-current">
              <UsersIcon />
            </span>
            <span>ユーザ一覧</span>
          </button>

          {/* 掲示板（将来追加予定） */}
          <button
            type="button"
            className="flex flex-col items-center text-[10px] font-medium text-gray-600 hover:text-blue-600"
          >
            <span className="text-current">
              <BoardIcon />
            </span>
            <span>掲示板</span>
          </button>

          {/* =====================
              アカウントボタン
          ===================== */}
          <button
            onClick={() => router.push("/account")}
            className="flex flex-col items-center text-[10px] font-medium text-gray-700 hover:text-blue-600"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-current">
              <UserIcon />
            </span>
            <span>{user ? user.nickname : "ゲスト"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
