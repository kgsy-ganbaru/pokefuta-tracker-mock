"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isView = pathname === "/";
  const isEdit = pathname.startsWith("/update");

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-800">
          Pokefuta Tracker
        </h1>

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => router.push("/")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${
                isView
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            一覧
          </button>

          <button
            onClick={() => router.push("/update")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition
              ${
                isEdit
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            登録・削除
          </button>
        </div>
      </div>
    </header>
  );
}
