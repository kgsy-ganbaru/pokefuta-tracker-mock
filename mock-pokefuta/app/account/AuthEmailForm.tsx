"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { EmailActionState } from "../actions/auth";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="pft-primary-button w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-60">{pending ? pendingLabel : label}</button>;
}

export default function AuthEmailForm({
  action,
  label,
  pendingLabel,
}: {
  action: (state: EmailActionState, formData: FormData) => Promise<EmailActionState>;
  label: string;
  pendingLabel: string;
}) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <input type="email" name="email" required autoComplete="email" placeholder="メールアドレス" className="w-full rounded-lg border px-3 py-3" />
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{state.success}</p>}
      <SubmitButton label={label} pendingLabel={pendingLabel} />
    </form>
  );
}

