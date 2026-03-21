import { readChapterBySlug, renderMarkdown } from "@/lib/content/markdown";
import { normalizeGoogleMapsUrl } from "@/lib/googleMaps";
import { notFound } from "next/navigation";
import ChapterMapClient from "@/components/ChapterMapClient";
import SiteHeaderBadge from "@/components/SiteHeaderBadge";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const chapter = await readChapterBySlug(slug);
    const { frontmatter, pages } = chapter;
    const title = frontmatter.title || "Chapter";
    const description =
      frontmatter.summary || `收錄 ${pages.length} 篇 page 的 chapter 精選。`;

    return {
      title,
      description,
      alternates: {
        canonical: `/chapter/${slug}`,
      },
      openGraph: {
        type: "article",
        url: `/chapter/${slug}`,
        title,
        description,
        publishedTime: frontmatter.date,
        images: frontmatter.cover_image
          ? [
              {
                url: frontmatter.cover_image,
                alt: frontmatter.cover_image_alt || title,
              },
            ]
          : undefined,
      },
      twitter: {
        card: frontmatter.cover_image ? "summary_large_image" : "summary",
        title,
        description,
        images: frontmatter.cover_image ? [frontmatter.cover_image] : undefined,
      },
    };
  } catch {
    return {
      title: "Chapter not found",
      description: "找不到指定的 chapter。",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function ChapterPage({ params }) {
  const { slug: paramsSlug } = await params;

  let chapter;
  try {
    chapter = await readChapterBySlug(paramsSlug);
  } catch (e) {
    notFound();
  }

  const { frontmatter, pages } = chapter;

  const renderedPages = await Promise.all(
    pages.map(async (page, idx) => {
      const html = await renderMarkdown(page.content);
      return {
        id: page.frontmatter.slug || `page-${idx}`,
        title: page.frontmatter.title || "Untitled",
        summary: page.frontmatter.summary || "",
        cover_image: page.frontmatter.cover_image || "",
        location_name: page.frontmatter.location_name || "",
        location_address: page.frontmatter.location_address || "",
        location_url: normalizeGoogleMapsUrl(
          page.frontmatter.location_url || "",
          page.frontmatter.location_name || "",
          page.frontmatter.location_address || ""
        ),
        htmlContent: html || "",
      };
    })
  );

  const locations = renderedPages
    .filter((p) => p.location_name && p.location_url)
    .map((p) => ({
      name: p.location_name,
      url: p.location_url,
      title: p.title,
      slug: p.id,
    }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
        <SiteHeaderBadge className="mb-6" />

        <header className="mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight">{frontmatter.title}</h1>
          <div className="flex items-center text-sm text-slate-500 gap-2 mb-6">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200">{pages.length} 篇內容</span>
            <span>•</span>
            <time>{frontmatter.date}</time>
          </div>
        </header>

        {locations.length > 0 && (
          <div className="relative w-full max-w-full min-w-0">
            <ChapterMapClient locations={locations} />
          </div>
        )}

        <main className="space-y-6">
          {renderedPages.map((page, idx) => (
            <details key={page.id} id={page.id} className="group border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-slate-300 scroll-mt-8">
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <div className="flex items-start gap-4">
                  <span className="text-slate-300 font-mono text-lg mt-1">{(idx + 1).toString().padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-bold group-open:text-slate-900 transition-colors">{page.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 group-open:hidden">{page.summary}</p>
                  </div>
                </div>
                <div className="text-slate-400 group-open:rotate-180 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </summary>

              <div className="px-6 pb-8 pt-2 border-t border-slate-50">
                {page.cover_image && <img src={page.cover_image} alt={page.title} className="w-full aspect-video object-cover rounded-xl mb-8 bg-slate-50" />}

                <div
                  className="prose prose-slate max-w-none prose-sm sm:prose-base
                    prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                    prose-p:leading-relaxed prose-p:mb-4
                    prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: page.htmlContent }}
                />

                {page.location_name && (
                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📍</span>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{page.location_name}</div>
                        <div className="text-xs text-slate-500">{page.location_address}</div>
                      </div>
                    </div>
                    <a href={page.location_url} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-slate-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-slate-800 transition-colors">
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
