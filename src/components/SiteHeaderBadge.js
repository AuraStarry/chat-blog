import Link from "next/link";

export default function SiteHeaderBadge({ className = "" }) {
  return (
    <div className={className}>
      <Link
        href="/"
        className="inline-block text-sm font-semibold tracking-wide text-slate-500 hover:text-slate-700 transition-colors"
      >
        高黑的冒險筆記
      </Link>
    </div>
  );
}
