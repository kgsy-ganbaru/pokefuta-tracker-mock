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
      <div className="space-y-1">
        <label htmlFor="register-user-id" className="block text-sm font-semibold text-gray-800">
          ユーザID
        </label>
        <input
          id="register-user-id"
          name="userId"
          placeholder="例：pikachu25"
          className="w-full rounded border px-3 py-2"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          pattern="[a-z0-9_-]+"
          required
          aria-describedby="register-user-id-help"
        />
        <p id="register-user-id-help" className="text-xs leading-5 text-gray-500">
          ログイン時に毎回使います。3〜20文字の半角英小文字・数字・「-」「_」で、覚えやすい名前を決めてください。
        </p>
      </div>

      <input
        name="nickname"
        placeholder="ニックネーム"
        className="w-full border px-3 py-2 rounded"
        autoComplete="nickname"
        maxLength={50}
        required
      />

      <PasswordInput
        name="inviteCode"
        placeholder="招待コード"
        autoComplete="off"
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
