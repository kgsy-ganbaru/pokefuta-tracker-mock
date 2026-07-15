"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { LogoutState } from "../actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="mt-6 w-full rounded bg-gray-200 py-3 font-semibold hover:bg-gray-300 disabled:opacity-70"
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
        <p role="alert" className="mt-2 text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
