"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { RegisterState } from "../../actions/auth";
import PasswordInput from "../../components/PasswordInput";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="pft-primary-button w-full rounded py-3 font-semibold disabled:opacity-70"
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
        placeholder="ユーザID"
        className="w-full border px-3 py-2 rounded"
        autoComplete="username"
        maxLength={50}
        required
      />

      <input
        name="nickname"
        placeholder="ニックネーム"
        className="w-full border px-3 py-2 rounded"
        autoComplete="nickname"
        maxLength={50}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        className="w-full rounded border px-3 py-3"
        autoComplete="email"
        required
      />

      <PasswordInput
        name="password"
        placeholder="パスワード（8文字以上）"
        autoComplete="new-password"
        minLength={8}
      />

      <PasswordInput
        name="passwordConfirmation"
        placeholder="パスワード（確認）"
        autoComplete="new-password"
        minLength={8}
      />

      {state.error && (
        <p role="alert" className="text-sm text-red-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
