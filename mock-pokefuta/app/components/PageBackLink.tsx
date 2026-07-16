import Link from "next/link";

export default function PageBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Link>
  );
}
