"use client";

import { useFormStatus } from "react-dom";
import LoadingOverlay from "../components/LoadingOverlay";

export default function AdminSubmitButton({
  children,
  className,
  confirmMessage,
}: {
  children: React.ReactNode;
  className: string;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();
  return <>
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      {children}
    </button>
    {pending && <LoadingOverlay />}
  </>;
}

