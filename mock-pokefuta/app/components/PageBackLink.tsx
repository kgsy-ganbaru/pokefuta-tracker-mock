import Link from "next/link";

export default function PageBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="pft-back-button"
    >
      <span>{label}</span>
    </Link>
  );
}
