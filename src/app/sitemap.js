import { listAllChapters, listAllPages } from "@/lib/content/markdown";
import { SITE_URL } from "@/lib/seo/site";

export default async function sitemap() {
  const [pages, chapters] = await Promise.all([listAllPages(), listAllChapters()]);

  const pageEntries = pages
    .filter((page) => page.status === "published")
    .map((page) => ({
      url: `${SITE_URL}/page/${page.slug}`,
      lastModified: page.date ? new Date(page.date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const chapterEntries = chapters
    .filter((chapter) => chapter.status === "published")
    .map((chapter) => ({
      url: `${SITE_URL}/chapter/${chapter.slug}`,
      lastModified: chapter.date ? new Date(chapter.date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...pageEntries,
    ...chapterEntries,
  ];
}
