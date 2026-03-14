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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-12">
      <h1 className="text-4xl font-black mb-8">{frontmatter.title}</h1>
      <div className="space-y-6">
        {renderedPosts.map(post => (
          <div key={post.slug} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold">{post.title}</h3>
            <div className="mt-4 prose prose-slate" dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
          </div>
        ))}
      </div>
    </div>
  );
}
