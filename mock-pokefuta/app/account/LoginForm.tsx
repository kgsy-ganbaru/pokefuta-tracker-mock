"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { LoginState } from "../actions/auth";
import Link from "next/link";
import PasswordInput from "../components/PasswordInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="pft-primary-button w-full rounded py-3 font-semibold disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "ログイン中..." : "ログイン"}
    </button>
  );
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
        placeholder="ユーザID または メールアドレス"
        className="w-full border px-3 py-2 rounded"
        autoComplete="username"
        required
      />

      <PasswordInput
        name="password"
        placeholder="パスワード"
        autoComplete="current-password"
      />

      <div className="text-right">
        <Link href="/account/forgot-password" className="text-sm font-semibold text-emerald-700 hover:underline">パスワードを忘れた方</Link>
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
