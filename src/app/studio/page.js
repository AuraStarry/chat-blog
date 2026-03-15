import { readPageBySlug } from "@/lib/content/markdown";
import { PAGE_STATUS } from "@/lib/content/schema";
import StudioForm from "./StudioForm";
import { createDraftAction } from "./actions";
import styles from "./page.module.scss";

export const metadata = {
  title: "Studio | chat-blog",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StudioPage({ searchParams }) {
  const params = await searchParams;
  const saved = params?.saved;

  let initialData = {
    title: "",
    slug: "",
    summary: "",
    category: "",
    tags: "",
    cover_image: "",
    cover_image_alt: "",
    location_name: "",
    location_address: "",
    location_url: "",
    date: new Date().toISOString().slice(0, 10),
    content: "",
    status: PAGE_STATUS.DRAFT,
  };

  if (saved) {
    try {
      const page = await readPageBySlug(saved);
      initialData = {
        title: page.frontmatter.title || "",
        slug: page.frontmatter.slug || saved,
        summary: page.frontmatter.summary || "",
        category: page.frontmatter.category || "",
        tags: page.frontmatter.tags?.join(", ") || "",
        cover_image: page.frontmatter.cover_image || "",
        cover_image_alt: page.frontmatter.cover_image_alt || "",
        location_name: page.frontmatter.location_name || "",
        location_address: page.frontmatter.location_address || "",
        location_url: page.frontmatter.location_url || "",
        date: page.frontmatter.date || initialData.date,
        content: page.content || "",
        status: page.frontmatter.status || PAGE_STATUS.DRAFT,
      };
    } catch (e) {
      console.error("Failed to load page:", e);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.card}>
          <h1 className={styles.title}>chat-blog 共編區（v1）</h1>
          <p className={styles.note}>手機優先、單欄、UI 編輯；底層自動寫回 Markdown。</p>
          <div style={{ marginTop: 12 }}>
            <a
              href="/studio/chapter"
              className={styles.button}
              style={{ background: "#27272a", color: "#fafafa", border: "1px solid #3f3f46", padding: "8px 12px", fontSize: 13 }}
            >
              進入 Chapter 編輯器
            </a>
          </div>
        </section>

        {saved ? (
          <div className={styles.card} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className={styles.success} style={{ margin: 0 }}>正在編輯：{saved}.md</p>
            <a
              href={`/page/${saved}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.button} ${styles.previewButton}`}
            >
              查看預覽 ↗
            </a>
          </div>
        ) : null}

        <StudioForm initialData={initialData} saveAction={createDraftAction} pageStatusConstants={PAGE_STATUS} />
      </div>
    </main>
  );
}
