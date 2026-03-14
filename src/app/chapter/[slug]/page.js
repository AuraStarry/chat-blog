import { readChapterBySlug, renderMarkdown } from "@/lib/content/markdown";
import { notFound } from "next/navigation";
import ChapterMap from "@/components/ChapterMap";

export default async function ChapterPage({ params }) {
  const { slug } = await params;

  let chapter;
  try {
    chapter = await readChapterBySlug(slug);
  } catch (e) {
    notFound();
  }

  const { frontmatter, posts } = chapter;

  // Collect locations for the map
  const locations = posts
    .filter(p => p.frontmatter.location_name && p.frontmatter.location_url)
    .map(p => ({
      name: p.frontmatter.location_name,
      url: p.frontmatter.location_url,
      title: p.frontmatter.title,
      slug: p.frontmatter.slug
    }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-8">
          <h1 className="text-4xl font-black mb-4 tracking-tight text-slate-900">{frontmatter.title}</h1>
          <div className="flex items-center text-sm text-slate-500 gap-2 mb-6">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">{posts.length} 篇文章</span>
            <span>•</span>
            <time>{frontmatter.date}</time>
          </div>
        </header>

        {/* Map Area */}
        {locations.length > 0 && (
          <ChapterMap locations={locations} />
        )}

        <main className="space-y-6">
          {posts.map(async (post, idx) => {
            const htmlContent = await renderMarkdown(post.content);
            return (
              <details key={idx} id={post.frontmatter.slug} className="group border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300 scroll-mt-8">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <div className="flex items-start gap-4">
                    <span className="text-slate-300 font-mono text-lg mt-1">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <h3 className="text-xl font-bold group-open:text-slate-900 transition-colors">
                        {post.frontmatter.title}
                      </h3>
                      {post.frontmatter.summary && !post.frontmatter.title.includes(post.frontmatter.summary) && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1 group-open:hidden">
                          {post.frontmatter.summary}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-400 group-open:rotate-180 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                
                <div className="px-6 pb-8 pt-2 border-t border-slate-50">
                  {post.frontmatter.cover_image && (
                    <img 
                      src={post.frontmatter.cover_image} 
                      alt={post.frontmatter.title}
                      className="w-full aspect-video object-cover rounded-xl mb-8 bg-slate-50"
                    />
                  )}
                  
                  <div 
                    className="prose prose-slate max-w-none prose-sm sm:prose-base font-serif
                      prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                      prose-p:leading-relaxed prose-p:mb-4
                      prose-img:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: htmlContent }} 
                  />

                  {post.frontmatter.location_name && (
                    <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{post.frontmatter.location_name}</div>
                          <div className="text-xs text-slate-500">{post.frontmatter.location_address}</div>
                        </div>
                      </div>
                      <a 
                        href={post.frontmatter.location_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors"
                      >
                        地圖
                      </a>
                    </div>
                  )}
                  
                  <div className="mt-10 text-center">
                    <a 
                      href={`/post/${post.frontmatter.slug}`}
                      className="text-sm text-slate-400 font-medium hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
                    >
                      閱讀全文 ↗
                    </a>
                  </div>
                </div>
              </details>
            );
          })}
        </main>
      </div>
    </div>
  );
}
