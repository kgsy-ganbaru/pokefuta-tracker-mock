"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { LogoutState } from "../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-6 w-full py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}

export default function LogoutForm({
  action,
}: {
  action: (state: LogoutState, formData: FormData) => Promise<LogoutState>;
}) {
  const [state, formAction] = useFormState(action, {
    error: "",
  });

  return (
    <form action={formAction}>
      <SubmitButton />
      {state.error && (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
