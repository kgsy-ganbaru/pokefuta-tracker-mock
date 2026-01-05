"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SortKey =
  | "pokefuta-desc"
  | "pokefuta-asc"
  | "nickname-asc"
  | "nickname-desc"
  | "registered-asc"
  | "registered-desc";

export type UserListItem = {
  id: string;
  name: string;
  pokefutaCount: number;
  registeredAt: string;
};

type UsersListClientProps = {
  users: UserListItem[];
  isReady: boolean;
  currentUser?: UserListItem | null;
};

const sortLabels: Record<SortKey, string> = {
  "pokefuta-desc": "ポケフタ所持数：多い順",
  "pokefuta-asc": "ポケフタ所持数：少ない順",
  "nickname-asc": "ユーザー名：昇順",
  "nickname-desc": "ユーザー名：降順",
  "registered-asc": "登録日：古い順",
  "registered-desc": "登録日：新しい順",
};

const sorters: Record<SortKey, (a: UserListItem, b: UserListItem) => number> =
  {
    "pokefuta-desc": (a, b) => b.pokefutaCount - a.pokefutaCount,
    "pokefuta-asc": (a, b) => a.pokefutaCount - b.pokefutaCount,
    "nickname-asc": (a, b) => a.name.localeCompare(b.name, "ja"),
    "nickname-desc": (a, b) => b.name.localeCompare(a.name, "ja"),
    "registered-asc": (a, b) =>
      new Date(a.registeredAt || 0).getTime() -
      new Date(b.registeredAt || 0).getTime(),
    "registered-desc": (a, b) =>
      new Date(b.registeredAt || 0).getTime() -
      new Date(a.registeredAt || 0).getTime(),
  };

const SortIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h8" />
    <path d="M4 12h12" />
    <path d="M4 17h16" />
    <path d="M17 8l3-3 3 3" />
    <path d="M20 5v8" />
  </svg>
);

function formatDate(value: string) {
  if (!value) return "未登録";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未登録";
  return date.toLocaleDateString("ja-JP");
}

export default function UsersListClient({
  users,
  isReady,
  currentUser,
}: UsersListClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>("pokefuta-desc");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sortedUsers = useMemo(() => {
    return [...users].sort(sorters[sortKey]);
  }, [sortKey, users]);

  const currentSortLabel = sortLabels[sortKey];

  return (
    <>
      {currentUser ? (
        <section className="mb-6 rounded-lg border border-blue-200 bg-white">
          <div className="border-b border-blue-100 px-4 py-3">
            <p className="text-sm font-semibold text-blue-700">自分のデータ</p>
          </div>
          <ul className="divide-y">
            <li>
              <Link
                href={`/users/${currentUser.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-blue-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    登録日：{formatDate(currentUser.registeredAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    登録枚数：{currentUser.pokefutaCount}枚
                  </p>
                  <span className="text-xs text-blue-600">
                    詳細を見る
                  </span>
                </div>
              </Link>
            </li>
          </ul>
        </section>
      ) : null}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            ユーザー一覧
          </h2>
          <p className="text-sm text-gray-500">
            ユーザーを選択すると、所持しているポケフタの状況を確認できます。
          </p>
          <div className="mt-2 text-xs text-gray-500">
            登録ユーザー：
            <span className="ml-1 font-semibold text-gray-700">
              {users.length}人
            </span>
          </div>
        </div>

        <div className="relative flex w-full justify-end sm:w-auto">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <SortIcon />
            <span className="hidden sm:inline">{currentSortLabel}</span>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg">
              {(
                Object.keys(sortLabels) as Array<keyof typeof sortLabels>
              ).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSortKey(key);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    sortKey === key
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="rounded-lg border bg-white">
        {!isReady ? (
          <div className="px-4 py-6 text-sm text-gray-500">
            Supabaseの接続設定が未完了のため、ユーザー一覧を取得できませんでした。
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-500">
            まだユーザーが登録されていません。
          </div>
        ) : (
          <ul className="divide-y">
            {sortedUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/users/${user.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      登録日：{formatDate(user.registeredAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      登録枚数：{user.pokefutaCount}枚
                    </p>
                    <span className="text-xs text-blue-600">詳細を見る</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
