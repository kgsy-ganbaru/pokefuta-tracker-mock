"use client";

import { useState } from "react";

type PasswordInputProps = {
  name: string;
  placeholder: string;
  autoComplete: string;
  minLength?: number;
};

export default function PasswordInput({ name, placeholder, autoComplete, minLength }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-3 pr-16"
        autoComplete={autoComplete}
        minLength={minLength}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-emerald-700"
        aria-label={visible ? `${placeholder}を隠す` : `${placeholder}を表示する`}
      >
        {visible ? "隠す" : "表示"}
      </button>
    </div>
  );
}

