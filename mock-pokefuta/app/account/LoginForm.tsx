"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { LoginState } from "../actions/auth";

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
        placeholder="ユーザID"
        className="w-full border px-3 py-2 rounded"
        autoComplete="username"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="パスワード"
        className="w-full border px-3 py-2 rounded"
        autoComplete="current-password"
        minLength={6}
        required
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
