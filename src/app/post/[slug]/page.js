import { readPostBySlug, renderMarkdown } from "@/lib/content/markdown";
import { normalizeGoogleMapsUrl } from "@/lib/googleMaps";
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
  const mapsUrl = normalizeGoogleMapsUrl(
    frontmatter.location_url,
    frontmatter.location_name,
    frontmatter.location_address
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <article className="max-w-[700px] mx-auto px-6 py-12 md:py-20">
        <header className="mb-12">
          <div className="flex items-center text-sm text-slate-500 gap-2 mb-6">
            <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            <span>·</span>
            <span className="font-medium text-slate-700">{frontmatter.category || "Journal"}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight leading-tight text-slate-900">
            {frontmatter.title}
          </h1>
          
          {frontmatter.summary && !frontmatter.title.includes(frontmatter.summary) && (
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-serif italic mb-10 border-l-2 border-slate-100 pl-6">
              {frontmatter.summary}
            </p>
          )}

          {frontmatter.cover_image && (
            <figure className="mt-12 -mx-6 md:-mx-12">
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
            <div className="mb-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Location</h2>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="font-bold text-2xl text-slate-900 mb-1">{frontmatter.location_name}</div>
                  {frontmatter.location_address && (
                    <div className="text-slate-500 text-sm">{frontmatter.location_address}</div>
                  )}
                </div>
                {mapsUrl && (
                  <a 
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-2 bg-slate-100 text-slate-900 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Open in Google Maps ↗
                  </a>
                )}
              </div>
              
              {frontmatter.location_name && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${encodeURIComponent(frontmatter.location_name + ' ' + (frontmatter.location_address || ''))}`}
                    allowFullScreen
                  ></iframe>
                  {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-400 text-xs text-center px-10">
                      Google Maps Embed 需要 API Key。<br/>目前僅顯示預留區塊。
                    </div>
                  )}
                </div>
              )}
            </div>
          </footer>
        )}
      </article>
    </div>
  );
}
