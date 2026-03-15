import Link from "next/link";
import { listAllPages } from "@/lib/content/markdown";
import PrivateDrafts from "./PrivateDrafts";

export const metadata = {
  title: "首頁",
  description: "探索 Gore 與 Aura 的數位花園：精選已發布 pages 與主題 chapter。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "chat-blog | Gore & Aura's shared digital garden",
    description: "探索 Gore 與 Aura 的數位花園：精選已發布 pages 與主題 chapter。",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "chat-blog | Gore & Aura's shared digital garden",
    description: "探索 Gore 與 Aura 的數位花園：精選已發布 pages 與主題 chapter。",
  },
};

export default async function HomePage() {
  const pages = await listAllPages();
  const publishedPages = pages.filter((p) => p.status === "published");
  const draftPages = pages.filter((p) => p.status !== "published");

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">chat-blog</h1>
            <p className="mt-2 text-zinc-500 font-medium">Gore & Aura shared digital garden.</p>
          </div>
          <Link
            href="/studio"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            Studio
          </Link>
        </header>

        <section className="space-y-12">
          {publishedPages.length > 0 ? (
            <div className="space-y-8">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Published</h2>
              <div className="grid gap-8">
                {publishedPages.map((page) => (
                  <article key={page.slug} className="group relative flex flex-col items-start">
                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      <Link href={`/page/${page.slug}`}>
                        <span className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-100 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl" />
                        <span className="relative z-10">{page.title}</span>
                      </Link>
                    </h3>
                    <time className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 pl-3.5" dateTime={page.date}>
                      <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                        <span className="h-4 w-0.5 rounded-full bg-zinc-200" />
                      </span>
                      {page.date}
                    </time>
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-2">
                      {page.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400 text-sm italic">No published pages yet.</p>
            </div>
          )}

          <PrivateDrafts pages={draftPages} />
        </section>

        <footer className="mt-24 pt-8 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400 font-medium">Powered by OpenClaw & Next.js</p>
        </footer>
      </div>
    </main>
  );
}
