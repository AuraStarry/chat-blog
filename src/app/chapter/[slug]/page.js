import { readChapterBySlug, renderMarkdown } from "@/lib/content/markdown";
import { notFound } from "next/navigation";

export default async function ChapterPage({ params }) {
  const { slug } = await params;

  let chapter;
  try {
    chapter = await readChapterBySlug(slug);
  } catch (e) {
    notFound();
  }

  const { frontmatter, posts } = chapter;

  const renderedPosts = await Promise.all(
    posts.map(async (post) => {
      const html = await renderMarkdown(post.content);
      return {
        slug: post.frontmatter.slug,
        title: post.frontmatter.title,
        summary: post.frontmatter.summary,
        cover_image: post.frontmatter.cover_image,
        location_name: post.frontmatter.location_name,
        location_address: post.frontmatter.location_address,
        location_url: post.frontmatter.location_url,
        htmlContent: html
      };
    })
  );

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
              </summary>
              <div className="px-6 pb-8 pt-2 border-t border-slate-50">
                <div className="prose prose-slate max-w-none">
                  {post.htmlContent.substring(0, 100)}...
                </div>
              </div>
            </details>
          ))}
        </main>
      </div>
    </div>
  );
}
