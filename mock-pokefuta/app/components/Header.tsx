"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const iconClassName = "h-6 w-6";
const iconStrokeWidth = 1.5;

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 11a3 3 0 1 0-6 0" />
    <path d="M8 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
    <path d="M4 12a3 3 0 1 0 6 0" />
    <path d="M2 21v-1a4 4 0 0 1 4-4" />
  </svg>
);

const BoardIcon = () => (
  <svg viewBox="0 0 24 24" className={iconClassName} fill="none" stroke="currentColor" strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
    <rect x="3" y="4" width="18" height="16" rx="2" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={iconStrokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
  </svg>
);

type HeaderUser = { nickname: string } | null;

type MainNavigationProps = {
  isHome: boolean;
  isUsers: boolean;
  isBoard: boolean;
  mobile?: boolean;
};

function MainNavigation({ isHome, isUsers, isBoard, mobile = false }: MainNavigationProps) {
  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center justify-center rounded-xl font-medium transition ${
      mobile ? "min-h-16 -translate-y-1 pb-2 pt-0.5 text-[11px]" : "w-[3em] shrink-0 py-1 text-[10px]"
    } ${active ? "bg-emerald-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`;

  const homeItem = (
    <Link key="home" href="/" aria-current={isHome ? "page" : undefined} className={itemClass(isHome)}>
      <HomeIcon />
      <span className="mt-0.5 whitespace-nowrap">ホーム</span>
    </Link>
  );
  const usersItem = (
    <Link key="users" href="/users" aria-current={isUsers ? "page" : undefined} className={itemClass(isUsers)}>
      <UsersIcon />
      <span className="mt-0.5 whitespace-nowrap">ユーザー一覧</span>
    </Link>
  );
  const boardItem = (
    <Link key="board" href="/board" aria-current={isBoard ? "page" : undefined} className={itemClass(isBoard)}>
      <BoardIcon />
      <span className="mt-0.5 whitespace-nowrap">掲示板</span>
    </Link>
  );

  return (
    <nav aria-label="メインメニュー" className={mobile ? "mx-auto flex max-w-md items-stretch gap-2 px-3 pb-1 pt-3" : "hidden items-start gap-4 sm:flex"}>
      {mobile ? [usersItem, homeItem, boardItem] : [homeItem, usersItem, boardItem]}
    </nav>
  );
}

export default function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isUsers = pathname?.startsWith("/users");
  const isBoard = pathname?.startsWith("/board");
  const isAccount = pathname?.startsWith("/account");

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4">
          <Link href="/" className="shrink-0 whitespace-nowrap rounded-md px-1 py-2 text-[13px] font-semibold text-gray-800 sm:text-lg">
            Pokefuta-Tracker
          </Link>

          <div className="flex items-start gap-3 sm:gap-4">
            <MainNavigation isHome={isHome} isUsers={isUsers} isBoard={isBoard} />
            <Link
              href="/account"
              aria-current={isAccount ? "page" : undefined}
              aria-label={user ? `${user.nickname}のアカウント設定` : "アカウント設定"}
              className={`flex min-w-14 max-w-24 shrink-0 flex-col items-center rounded-lg px-1 py-1 text-[10px] font-medium transition ${
                isAccount ? "bg-emerald-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-current">
                <UserIcon />
              </span>
              <span className="mt-1 w-full truncate text-center leading-3">{user ? user.nickname : "ゲスト"}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(74,105,75,0.12)] backdrop-blur-md sm:hidden">
        <MainNavigation isHome={isHome} isUsers={isUsers} isBoard={isBoard} mobile />
      </div>
    </>
  );
}
