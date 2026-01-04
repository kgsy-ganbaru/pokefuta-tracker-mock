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

type User = {
  id: string;
  name: string;
  pokefutaCount: number;
  registeredAt: string;
};

const users: User[] = [
  { id: "001", name: "サトシ", pokefutaCount: 42, registeredAt: "2023-02-18" },
  { id: "002", name: "ハルカ", pokefutaCount: 18, registeredAt: "2023-06-01" },
  { id: "003", name: "タケシ", pokefutaCount: 35, registeredAt: "2022-11-09" },
  { id: "004", name: "カスミ", pokefutaCount: 27, registeredAt: "2024-01-22" },
  { id: "005", name: "ヒカリ", pokefutaCount: 12, registeredAt: "2024-05-08" },
];

const sortLabels: Record<SortKey, string> = {
  "pokefuta-desc": "ポケフタ所持数：多い順",
  "pokefuta-asc": "ポケフタ所持数：少ない順",
  "nickname-asc": "ユーザー名：昇順",
  "nickname-desc": "ユーザー名：降順",
  "registered-asc": "登録日：古い順",
  "registered-desc": "登録日：新しい順",
};

const sorters: Record<SortKey, (a: User, b: User) => number> = {
  "pokefuta-desc": (a, b) => b.pokefutaCount - a.pokefutaCount,
  "pokefuta-asc": (a, b) => a.pokefutaCount - b.pokefutaCount,
  "nickname-asc": (a, b) => a.name.localeCompare(b.name, "ja"),
  "nickname-desc": (a, b) => b.name.localeCompare(a.name, "ja"),
  "registered-asc": (a, b) =>
    new Date(a.registeredAt).getTime() -
    new Date(b.registeredAt).getTime(),
  "registered-desc": (a, b) =>
    new Date(b.registeredAt).getTime() -
    new Date(a.registeredAt).getTime(),
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

export default function UsersPage() {
  const [sortKey, setSortKey] = useState<SortKey>("pokefuta-desc");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sortedUsers = useMemo(() => {
    return [...users].sort(sorters[sortKey]);
  }, [sortKey]);

  const currentSortLabel = sortLabels[sortKey];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">ユーザー一覧</h2>
          <p className="text-sm text-gray-500">
            ユーザーを選択すると、所持しているポケフタの状況を確認できます。
          </p>
        </div>

        <div className="relative">
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
        <ul className="divide-y">
          {sortedUsers.map((user) => (
            <li key={user.id}>
              <Link
                href={`/users/${user.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    所持ポケフタ：{user.pokefutaCount}枚
                  </p>
                </div>
                <span className="text-xs text-blue-600">詳細を見る</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
