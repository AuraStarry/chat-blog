import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-bold">chat-blog</h1>
        <p className="mt-2 text-sm text-zinc-600">Markdown 為儲存核心，手機優先的 GUI 共編。</p>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/studio"
            className="rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            進入共編區 /studio
          </Link>
        </div>
      </div>
    </main>
  );
}
