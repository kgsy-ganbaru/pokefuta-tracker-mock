"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { RegisterState } from "../../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "登録中..." : "新規登録"}
    </button>
  );
}

export default function RegisterForm({
  action,
}: {
  action: (state: RegisterState, formData: FormData) => Promise<RegisterState>;
}) {
  const [state, formAction] = useFormState(action, {
    error: "",
  });

  return (
    <form action={formAction} className="space-y-2">
      <input
        name="userId"
        placeholder="ユーザーID"
        className="w-full border px-3 py-2 rounded"
        autoComplete="username"
      />

      <input
        name="nickname"
        placeholder="ニックネーム"
        className="w-full border px-3 py-2 rounded"
        autoComplete="nickname"
      />

      <input
        type="password"
        name="password"
        placeholder="パスワード"
        className="w-full border px-3 py-2 rounded"
        autoComplete="new-password"
      />

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
