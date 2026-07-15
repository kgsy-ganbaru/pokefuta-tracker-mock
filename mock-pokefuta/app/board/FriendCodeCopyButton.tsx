"use client";

import { useState } from "react";

export default function FriendCodeCopyButton({ code, showCode = false }: { code: string | null; showCode?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" aria-label={`フレンドコード ${code} をコピー`}>
      {showCode && <span>{code}</span>}<span>{copied ? "コピー済み" : "コピー"}</span>
    </button>
  );
}
