import { readPostBySlug } from "@/lib/content/markdown";
import { POST_STATUS } from "@/lib/content/schema";
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
    status: POST_STATUS.DRAFT,
  };

  if (saved) {
    try {
      const post = await readPostBySlug(saved);
      initialData = {
        title: post.frontmatter.title || "",
        slug: post.frontmatter.slug || saved,
        summary: post.frontmatter.summary || "",
        category: post.frontmatter.category || "",
        tags: post.frontmatter.tags?.join(", ") || "",
        cover_image: post.frontmatter.cover_image || "",
        cover_image_alt: post.frontmatter.cover_image_alt || "",
        location_name: post.frontmatter.location_name || "",
        location_address: post.frontmatter.location_address || "",
        location_url: post.frontmatter.location_url || "",
        date: post.frontmatter.date || initialData.date,
        content: post.content || "",
        status: post.frontmatter.status || POST_STATUS.DRAFT,
      };
    } catch (e) {
      console.error("Failed to load post:", e);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.card}>
          <h1 className={styles.title}>chat-blog 共編區（v1）</h1>
          <p className={styles.note}>手機優先、單欄、UI 編輯；底層自動寫回 Markdown。</p>
        </section>

        {saved ? (
          <div className={styles.card} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className={styles.success} style={{ margin: 0 }}>正在編輯：{saved}.md</p>
            <a 
              href={`/post/${saved}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.button}
              style={{ padding: "4px 12px", fontSize: "12px", background: "#1e1e2e", border: "1px solid #313244" }}
            >
              查看預覽 ↗
            </a>
          </div>
        ) : null}

        <StudioForm 
          initialData={initialData} 
          saveAction={createDraftAction} 
          postStatusConstants={POST_STATUS} 
        />
      </div>
    </main>
  );
}
