import { readChapterBySlug, renderMarkdown } from "@/lib/content/markdown";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const ChapterMap = dynamic(() => import("@/components/ChapterMap"), { 
  ssr: false,
  loading: () => <div className="mb-12 aspect-[16/10] bg-slate-100 rounded-3xl animate-pulse" />
});

export default async function ChapterPage({ params }) {
  const { slug } = await params;

  let chapter;
  try {
    chapter = await readChapterBySlug(slug);
  } catch (e) {
    notFound();
  }

  const { frontmatter, posts } = chapter;

  // Pre-render all post content to a clean, serializable format
  const renderedPosts = await Promise.all(
    posts.map(async (post) => {
      const html = await renderMarkdown(post.content);
      return {
        slug: post.frontmatter.slug || Math.random().toString(),
        title: post.frontmatter.title || "Untitled",
        summary: post.frontmatter.summary || "",
        cover_image: post.frontmatter.cover_image || "",
        location_name: post.frontmatter.location_name || "",
        location_address: post.frontmatter.location_address || "",
        location_url: post.frontmatter.location_url || "",
        htmlContent: html || ""
      };
    })
  );

  // Collect locations for the map
  const locations = renderedPosts
    .filter(p => p.location_name && p.location_url)
    .map(p => ({
      name: p.location_name,
      url: p.location_url,
      title: p.title,
      slug: p.slug
    }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight">{frontmatter.title}</h1>
          <div className="flex items-center text-sm text-slate-500 gap-2 mb-6">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">{posts.length} 篇文章</span>
            <span>•</span>
            <time>{frontmatter.date}</time>
          </div>
        </header>

        {locations.length > 0 && (
          <ChapterMap locations={locations} />
        )}

        <main className="space-y-6">
          {renderedPosts.map((post, idx) => (
            <details key={post.slug} id={post.slug} className="group border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300 scroll-mt-8">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <div className="flex items-start gap-4">
                  <span className="text-slate-300 font-mono text-lg mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div>
                    <h3 className="text-xl font-bold group-open:text-slate-900 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 group-open:hidden">
                      {post.summary}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </summary>
              
              <div className="px-6 pb-8 pt-2 border-t border-slate-50">
                {post.cover_image && (
                  <img 
                    src={post.cover_image} 
                    alt={post.title}
                    className="w-full aspect-video object-cover rounded-xl mb-8 bg-slate-50"
                  />
                )}
                
                <div 
                  className="prose prose-slate max-w-none prose-sm sm:prose-base
                    prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                    prose-p:leading-relaxed prose-p:mb-4
                    prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: post.htmlContent }} 
                />

                {post.location_name && (
                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{post.location_name}</div>
                        <div className="text-xs text-slate-500">{post.location_address}</div>
                      </div>
                    </div>
                    <a 
                      href={post.location_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      地圖
                    </a>
                  </div>
                )}
              </div>
            </details>
          ))}
        </main>
      </div>
    </div>
  );
}
