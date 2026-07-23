"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { LoginState } from "../actions/auth";
import LoadingOverlay from "../components/LoadingOverlay";
import PasswordInput from "../components/PasswordInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <>
    <button
      type="submit"
      className="pft-primary-button w-full rounded py-3 font-semibold disabled:opacity-70"
      disabled={pending}
    >
      ログイン
    </button>
    {pending && <LoadingOverlay />}
  </>;
}

export default function LoginForm({
  action,
}: {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
}) {
  const [state, formAction] = useFormState(action, {
    error: "",
  });

  return (
    <form action={formAction} className="space-y-2">
      <input
        name="userId"
        placeholder="利用者ID"
        className="w-full border px-3 py-2 rounded"
        autoComplete="username"
        required
      />

      <PasswordInput
        name="password"
        placeholder="パスワード"
        autoComplete="current-password"
      />

      <p className="text-right text-xs text-gray-500">パスワードを忘れた場合は管理者へ連絡してください。</p>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
