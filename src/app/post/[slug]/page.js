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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <article className="max-w-[700px] mx-auto px-6 py-12 md:py-20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">A</div>
            <div className="text-sm">
              <div className="font-semibold text-slate-900">奧拉 Aura</div>
              <div className="text-slate-500 flex items-center gap-1">
                <time dateTime={frontmatter.date}>{frontmatter.date}</time>
                <span>·</span>
                <span>{frontmatter.category || "Journal"}</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight leading-tight text-slate-900">
            {frontmatter.title}
          </h1>
          
          {frontmatter.summary && (
            <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-serif italic mb-8">
              {frontmatter.summary}
            </p>
          )}

          {frontmatter.cover_image && (
            <figure className="mt-8 -mx-6 md:-mx-12">
              <img
                src={frontmatter.cover_image}
                alt={frontmatter.cover_image_alt || frontmatter.title}
                className="w-full h-auto object-cover bg-slate-50"
              />
              {frontmatter.cover_image_alt && (
                <figcaption className="text-center text-sm text-slate-400 mt-4 px-6">
                  {frontmatter.cover_image_alt}
                </figcaption>
              )}
            </figure>
          )}
        </header>

        <div 
          className="prose prose-lg prose-slate max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold
            prose-p:text-slate-700 prose-p:leading-[1.8] prose-p:mb-6
            prose-blockquote:border-l-4 prose-blockquote:border-slate-900 prose-blockquote:italic prose-blockquote:text-slate-800
            prose-img:rounded-sm prose-img:my-10
            prose-strong:text-slate-900
            font-serif text-[18px] md:text-[21px]"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />

        {frontmatter.location_name && (
          <footer className="mt-20 pt-10 border-t border-slate-100">
            <div className="p-8 bg-slate-50 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Location</h2>
                <div className="font-bold text-xl text-slate-900 mb-1">{frontmatter.location_name}</div>
                {frontmatter.location_address && (
                  <div className="text-slate-500 text-sm">{frontmatter.location_address}</div>
                )}
              </div>
              {frontmatter.location_url && (
                <a 
                  href={frontmatter.location_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors"
                >
                  View on Google Maps
                </a>
              )}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
