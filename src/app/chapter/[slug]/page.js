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

  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold">{frontmatter.title}</h1>
      <p className="mt-4 text-slate-500">Posts: {posts.length}</p>
    </div>
  );
}
