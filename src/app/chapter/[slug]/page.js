import { readChapterBySlug, renderMarkdown } from "@/lib/content/markdown";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Force ChapterMap to only load on client
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

  // Pre-render all post content
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

        {/* {locations.length > 0 && (
          <ChapterMap locations={locations} />
        )} */}

        <main className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500">正在偵錯：內容暫時隱藏以排查崩潰原因。</p>
            <ul className="mt-4 list-disc list-inside text-sm text-slate-400">
              {renderedPosts.map(p => <li key={p.slug}>{p.title}</li>)}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
