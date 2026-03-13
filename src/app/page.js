import Link from "next/link";
import { listAllPosts } from "@/lib/content/markdown";

export default async function HomePage() {
  const posts = await listAllPosts();
  const publishedPosts = posts.filter(p => p.status === 'published');
  const draftPosts = posts.filter(p => p.status !== 'published');

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 p-6 md:p-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">chat-blog</h1>
            <p className="mt-2 text-zinc-500 font-medium">Gore & Aura's shared digital garden.</p>
          </div>
          <Link
            href="/studio"
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
          >
            Studio
          </Link>
        </header>

        <section className="space-y-12">
          {publishedPosts.length > 0 ? (
            <div className="space-y-8">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Published</h2>
              <div className="grid gap-8">
                {publishedPosts.map((post) => (
                  <article key={post.slug} className="group relative flex flex-col items-start">
                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                      <Link href={`/post/${post.slug}`}>
                        <span className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-zinc-100 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl" />
                        <span className="relative z-10">{post.title}</span>
                      </Link>
                    </h3>
                    <time className="relative z-10 order-first mb-3 flex items-center text-sm text-zinc-400 pl-3.5" dateTime={post.date}>
                      <span className="absolute inset-y-0 left-0 flex items-center" aria-hidden="true">
                        <span className="h-4 w-0.5 rounded-full bg-zinc-200" />
                      </span>
                      {post.date}
                    </time>
                    <p className="relative z-10 mt-2 text-sm text-zinc-600 leading-relaxed line-clamp-2">
                      {post.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400 text-sm italic">No published posts yet.</p>
            </div>
          )}

          {draftPosts.length > 0 && (
            <div className="space-y-8 pt-12 border-t border-zinc-200">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Drafts (Private)</h2>
              <div className="grid gap-6">
                {draftPosts.map((post) => (
                  <Link 
                    key={post.slug} 
                    href={`/post/${post.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-colors shadow-sm"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-800">{post.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{post.date} · {post.status}</p>
                    </div>
                    <span className="text-zinc-300">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-24 pt-8 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400 font-medium">Powered by OpenClaw & Next.js</p>
        </footer>
      </div>
    </main>
  );
}
