import { readPostBySlug, renderMarkdown } from "@/lib/content/markdown";
import { notFound } from "next/navigation";

export default async function PostPage({ params }) {
  const { slug } = await params;

  let post;
  try {
    post = await readPostBySlug(slug);
  } catch (e) {
    notFound();
  }

  const { frontmatter, content } = post;
  const htmlContent = await renderMarkdown(content);

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        {frontmatter.cover_image && (
          <div className="mb-6 rounded-xl overflow-hidden aspect-video bg-gray-100">
            <img
              src={frontmatter.cover_image}
              alt={frontmatter.cover_image_alt || frontmatter.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
        
        <div className="flex items-center text-sm text-gray-500 gap-4">
          <time dateTime={frontmatter.date}>{frontmatter.date}</time>
          {frontmatter.category && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {frontmatter.category}
            </span>
          )}
        </div>
        
        {frontmatter.summary && (
          <p className="mt-4 text-lg text-gray-600 leading-relaxed italic">
            {frontmatter.summary}
          </p>
        )}
      </header>

      <div 
        className="prose prose-slate max-w-none 
          prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-p:leading-relaxed prose-p:mb-4
          prose-img:rounded-xl prose-img:my-8
          prose-strong:text-slate-900"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />

      {frontmatter.location_name && (
        <footer className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">地點資訊</h2>
          <div className="flex flex-col gap-1">
            <div className="font-bold text-lg">{frontmatter.location_name}</div>
            {frontmatter.location_address && (
              <div className="text-slate-500 text-sm">{frontmatter.location_address}</div>
            )}
            {frontmatter.location_url && (
              <a 
                href={frontmatter.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                在 Google Maps 中查看 ↗
              </a>
            )}
          </div>
        </footer>
      )}
    </article>
  );
}
