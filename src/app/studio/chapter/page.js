import { listAllPages, readChapterBySlug } from "@/lib/content/markdown";
import { PAGE_STATUS } from "@/lib/content/schema";
import ChapterForm from "./ChapterForm";
import { saveChapterAction } from "./actions";
import styles from "../page.module.scss";

export const metadata = {
  title: "Chapter Studio | chat-blog",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChapterStudioPage({ searchParams }) {
  const params = await searchParams;
  const saved = params?.saved;

  const allPages = await listAllPages();

  let initialData = {
    title: "",
    slug: "",
    summary: "",
    cover_image: "",
    cover_image_alt: "",
    date: new Date().toISOString().slice(0, 10),
    status: PAGE_STATUS.DRAFT,
    pages: [],
    content: "",
  };

  if (saved) {
    try {
      const chapter = await readChapterBySlug(saved);
      initialData = {
        title: chapter.frontmatter.title || "",
        slug: chapter.frontmatter.slug || saved,
        summary: chapter.frontmatter.summary || "",
        cover_image: chapter.frontmatter.cover_image || "",
        cover_image_alt: chapter.frontmatter.cover_image_alt || "",
        date: chapter.frontmatter.date || initialData.date,
        status: chapter.frontmatter.status || PAGE_STATUS.DRAFT,
        pages: chapter.frontmatter.pages || [],
        content: chapter.content || "",
      };
    } catch (e) {
      console.error("Failed to load chapter:", e);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.card}>
          <h1 className={styles.title}>Chapter 編輯區（v1）</h1>
          <p className={styles.note}>先定主題，再反覆追加 page、排序、儲存。</p>
        </section>

        {saved ? (
          <div className={styles.card} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className={styles.success} style={{ margin: 0 }}>正在編輯：{saved}.md</p>
            <a
              href={`/chapter/${saved}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} ${styles.previewButton}`}
            >
              查看預覽 ↗
            </a>
          </div>
        ) : null}

        <ChapterForm
          initialData={initialData}
          allPages={allPages}
          saveAction={saveChapterAction}
          pageStatusConstants={PAGE_STATUS}
        />
      </div>
    </main>
  );
}
