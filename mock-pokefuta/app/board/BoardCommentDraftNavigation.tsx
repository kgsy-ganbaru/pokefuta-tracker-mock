"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";

type DraftContextValue = { hasCommentDraft: boolean; setHasCommentDraft: (value: boolean) => void };
const DraftContext = createContext<DraftContextValue | null>(null);

export function BoardCommentDraftProvider({ children }: { children: React.ReactNode }) {
  const [hasCommentDraft, setHasCommentDraft] = useState(false);
  return <DraftContext.Provider value={{ hasCommentDraft, setHasCommentDraft }}>{children}</DraftContext.Provider>;
}

export function useBoardCommentDraft() {
  const value = useContext(DraftContext);
  if (!value) throw new Error("BoardCommentDraftProvider is required");
  return value;
}

export function DraftAwareUserLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const { hasCommentDraft } = useBoardCommentDraft();
  return <Link href={href} className={className} onClick={(event) => {
    if (hasCommentDraft && !window.confirm("入力中のコメントは破棄されます。利用者画面に移動してもよろしいですか？")) event.preventDefault();
  }}>{children}</Link>;
}
