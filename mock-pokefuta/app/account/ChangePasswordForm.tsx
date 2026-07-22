"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "../actions/auth";
import PasswordInput from "../components/PasswordInput";
import LoadingOverlay from "../components/LoadingOverlay";

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState<ChangePasswordState, FormData>(changePasswordAction, {});
  return <form action={action} className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
    <div><h2 className="font-bold text-amber-900">パスワードを変更してください</h2><p className="mt-1 text-sm leading-6 text-amber-800">管理者が設定した仮パスワードでログインしています。</p></div>
    <PasswordInput name="password" placeholder="新しいパスワード（8文字以上）" autoComplete="new-password" minLength={8} />
    <PasswordInput name="passwordConfirmation" placeholder="新しいパスワード（確認）" autoComplete="new-password" minLength={8} />
    {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="text-sm font-semibold text-emerald-700">パスワードを変更しました。</p>}
    <button type="submit" disabled={pending} className="pft-primary-button w-full rounded-full px-5 py-3 font-bold">パスワードを変更</button>
    {pending && <LoadingOverlay />}
  </form>;
}
