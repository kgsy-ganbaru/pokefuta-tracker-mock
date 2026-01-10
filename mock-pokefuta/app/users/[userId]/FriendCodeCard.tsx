"use client";

import { useState } from "react";

type FriendCodeCardProps = {
  friendCode: string | null;
};

export default function FriendCodeCard({
  friendCode,
}: FriendCodeCardProps) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(friendCode);

  const handleCopy = async () => {
    if (!friendCode) return;
    try {
      await navigator.clipboard.writeText(friendCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy friend code", error);
    }
  };

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700">
        フレンドコード
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700">
        <span className="font-mono tracking-widest text-gray-900">
          {friendCode ?? "未登録"}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>コード</span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!canCopy}
            className="rounded-full p-1 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400"
            aria-label="フレンドコードをコピー"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      </div>
      {copied ? (
        <p className="mt-2 text-xs text-green-600">
          クリップボードにフレンドコードをコピーしました
        </p>
      ) : null}
    </div>
  );
}
