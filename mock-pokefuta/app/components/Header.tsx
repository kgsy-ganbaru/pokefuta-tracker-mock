"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isUsers = pathname?.startsWith("/users");
  const isBoard = pathname?.startsWith("/board");
  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-2 py-2.5 sm:gap-4 sm:px-4">
        {/* =====================
            タイトル
        ===================== */}
        <Link href="/" className="shrink-0 whitespace-nowrap rounded-md px-1 py-2 text-[13px] font-semibold text-gray-800 sm:text-lg">
          ポケフタトラッカー
        </Link>

        {/* =====================
            右側メニュー
        ===================== */}
        <nav aria-label="メインメニュー" className="flex items-start gap-3 sm:gap-4">
          {/* ホーム */}
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            className={`flex w-[3em] shrink-0 flex-col items-center rounded-lg py-1 text-[10px] font-medium transition ${
              isHome ? "bg-emerald-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <span className="text-current">
              <HomeIcon />
            </span>
            <span className="mt-1 h-6 leading-3">ホーム</span>
          </Link>

          {/* ユーザ一覧 */}
          <Link
            href="/users"
            aria-current={isUsers ? "page" : undefined}
            className={`flex w-[3em] shrink-0 flex-col items-center rounded-lg py-1 text-[10px] font-medium transition ${
              isUsers ? "bg-emerald-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <span className="text-current">
              <UsersIcon />
            </span>
            <span className="mt-1 h-6 leading-3"><span className="block">ユーザ</span><span className="block">一覧</span></span>
          </Link>

          {/* 掲示板 */}
          <Link
            href="/board"
            aria-current={isBoard ? "page" : undefined}
            className={`flex w-[3em] shrink-0 flex-col items-center rounded-lg py-1 text-[10px] font-medium transition ${
              isBoard ? "bg-emerald-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <span className="text-current">
              <BoardIcon />
            </span>
            <span className="mt-1 h-6 leading-3">掲示板</span>
          </Link>

          {/* =====================
              アカウントボタン
          ===================== */}
          <Link
            href="/account"
            aria-current={pathname?.startsWith("/account") ? "page" : undefined}
            className={`flex w-[6em] shrink-0 flex-col items-center rounded-lg py-1 text-[10px] font-medium transition ${pathname?.startsWith("/account") ? "bg-emerald-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-current">
              <UserIcon />
            </span>
            <span className="mt-1 h-6 w-full truncate text-center leading-3">{user ? user.nickname : "ゲスト"}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
