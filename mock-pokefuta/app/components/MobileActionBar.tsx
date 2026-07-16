import { ReactNode } from "react";

export default function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="pft-mobile-action-bar fixed inset-x-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(74,105,75,0.10)] backdrop-blur-md">
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-3">
        {children}
      </div>
    </div>
  );
}
