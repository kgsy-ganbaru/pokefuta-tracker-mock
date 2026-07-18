"use client";

import { useState } from "react";
import { requestEmailChangeAction } from "../actions/auth";
import AuthEmailForm from "./AuthEmailForm";

export default function EmailSettings({ currentEmail, verified }: { currentEmail: string | null; verified: boolean }) {
  const [editing, setEditing] = useState(!currentEmail);
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800">メールアドレス</h2>
          <p className="mt-1 break-all text-sm text-gray-600">{currentEmail ?? "未登録"}</p>
          <p className={`mt-1 text-xs font-semibold ${verified ? "text-emerald-700" : "text-amber-700"}`}>{verified ? "確認済み" : "確認が必要です"}</p>
        </div>
        <button type="button" onClick={() => setEditing((value) => !value)} className="rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-700">{editing ? "閉じる" : currentEmail ? "変更" : "登録"}</button>
      </div>
      {editing && <div className="mt-4 border-t pt-4"><p className="mb-3 text-xs leading-5 text-gray-500">確認メール内のリンクを開くまで変更は完了しません。</p><AuthEmailForm action={requestEmailChangeAction} label={currentEmail ? "確認メールを送る" : "メールを登録する"} pendingLabel="送信中…" /></div>}
    </section>
  );
}

