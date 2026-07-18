"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { updatePasswordAction, type EmailActionState } from "../actions/auth";
import PasswordInput from "../components/PasswordInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="pft-primary-button w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-60">{pending ? "更新中…" : "新しいパスワードを設定"}</button>;
}

export default function PasswordResetForm() {
  const [state, formAction] = useFormState<EmailActionState, FormData>(updatePasswordAction, {});
  return (
    <form action={formAction} className="space-y-4">
      <PasswordInput name="password" placeholder="新しいパスワード（8文字以上）" autoComplete="new-password" minLength={8} />
      <PasswordInput name="passwordConfirmation" placeholder="新しいパスワード（確認）" autoComplete="new-password" minLength={8} />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.success ? (
        <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
          <p>{state.success}</p>
          <Link href="/account" className="mt-2 inline-block font-semibold underline">マイページへ</Link>
        </div>
      ) : <SubmitButton />}
    </form>
  );
}

