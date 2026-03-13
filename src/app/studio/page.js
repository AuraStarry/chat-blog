import Link from "next/link";
import { redirect } from "next/navigation";
import { saveDraftFromForm, readPostBySlug } from "@/lib/content/markdown";
import { POST_STATUS } from "@/lib/content/schema";
import styles from "./page.module.scss";

export const metadata = {
  title: "Studio | chat-blog",
};

async function createDraftAction(formData) {
  "use server";

  const payload = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    category: formData.get("category"),
    tags: formData.get("tags"),
    cover_image: formData.get("cover_image"),
    cover_image_alt: formData.get("cover_image_alt"),
    location_name: formData.get("location_name"),
    location_address: formData.get("location_address"),
    location_url: formData.get("location_url"),
    date: formData.get("date"),
    content: formData.get("content"),
    status: formData.get("status"),
  };

  const result = await saveDraftFromForm(payload);
  redirect(`/studio?saved=${encodeURIComponent(result.slug)}`);
}

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

        <form
          className={styles.card}
          action={async (formData) => {
            "use server";
            await createDraftAction(formData);
          }}
        >
          <div className={styles.grid}>
            <div>
              <label className={styles.label} htmlFor="title">標題</label>
              <input className={styles.input} id="title" name="title" placeholder="今天的主題" required defaultValue={initialData.title} />
            </div>

            <div>
              <label className={styles.label} htmlFor="slug">Slug（唯讀）</label>
              <input className={styles.input} id="slug" name="slug" placeholder="my-first-post" defaultValue={initialData.slug} readOnly />
              <p className={styles.note} style={{ marginTop: "4px" }}>目前暫不支援變更 Slug。</p>
            </div>

            <div>
              <label className={styles.label} htmlFor="summary">摘要</label>
              <textarea className={styles.textarea} id="summary" name="summary" placeholder="這篇文章在說什麼" defaultValue={initialData.summary} />
            </div>

            <div>
              <label className={styles.label} htmlFor="content">內文（Markdown）</label>
              <textarea className={styles.textarea} id="content" name="content" placeholder="# 標題\n\n開始寫你的內容..." defaultValue={initialData.content} style={{ minHeight: "300px" }} />
            </div>

            <div>
              <label className={styles.label} htmlFor="cover_image">Cover Image URL</label>
              <input className={styles.input} id="cover_image" name="cover_image" placeholder="/uploads/cover.jpg" defaultValue={initialData.cover_image} />
            </div>

            <div>
              <label className={styles.label} htmlFor="cover_image_alt">Cover Image Alt</label>
              <input className={styles.input} id="cover_image_alt" name="cover_image_alt" placeholder="封面圖片描述" defaultValue={initialData.cover_image_alt} />
            </div>

            <div>
              <label className={styles.label} htmlFor="tags">Tags（逗號分隔）</label>
              <input className={styles.input} id="tags" name="tags" placeholder="ai, blog, note" defaultValue={initialData.tags} />
            </div>

            <div>
              <label className={styles.label} htmlFor="category">Category</label>
              <input className={styles.input} id="category" name="category" placeholder="journal" defaultValue={initialData.category} />
            </div>

            <div>
              <label className={styles.label} htmlFor="date">Date</label>
              <input className={styles.input} id="date" name="date" type="date" defaultValue={initialData.date} />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_name">地點名稱</label>
              <input className={styles.input} id="location_name" name="location_name" placeholder="例如：某某咖啡廳" defaultValue={initialData.location_name} />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_address">地點地址</label>
              <input className={styles.input} id="location_address" name="location_address" placeholder="完整地址文字" defaultValue={initialData.location_address} />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_url">Google Maps URL</label>
              <input className={styles.input} id="location_url" name="location_url" placeholder="https://maps.google.com/..." defaultValue={initialData.location_url} />
            </div>

            <div>
              <label className={styles.label} htmlFor="status">狀態</label>
              <select className={styles.select} id="status" name="status" defaultValue={initialData.status}>
                <option value={POST_STATUS.DRAFT}>draft</option>
                <option value={POST_STATUS.REVIEW}>review</option>
                <option value={POST_STATUS.PUBLISHED}>published</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.button} type="submit">儲存變更</button>
            <Link href="/" className={styles.button} style={{ background: "transparent", color: "#a1a1aa", border: "1px solid #27272a" }}>
              返回首頁
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
