import Link from "next/link";
import { redirect } from "next/navigation";
import { saveDraftFromForm } from "@/lib/content/markdown";
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

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.card}>
          <h1 className={styles.title}>chat-blog 共編區（v1）</h1>
          <p className={styles.note}>手機優先、單欄、UI 編輯；底層自動寫回 Markdown。</p>
        </section>

        {saved ? <p className={styles.success}>草稿已儲存：{saved}.md</p> : null}

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
              <input className={styles.input} id="title" name="title" placeholder="今天的主題" required />
            </div>

            <div>
              <label className={styles.label} htmlFor="slug">Slug（可留空自動生成）</label>
              <input className={styles.input} id="slug" name="slug" placeholder="my-first-post" />
            </div>

            <div>
              <label className={styles.label} htmlFor="summary">摘要</label>
              <textarea className={styles.textarea} id="summary" name="summary" placeholder="這篇文章在說什麼" />
            </div>

            <div>
              <label className={styles.label} htmlFor="content">內文（Markdown）</label>
              <textarea className={styles.textarea} id="content" name="content" placeholder="# 標題\n\n開始寫你的內容..." />
            </div>

            <div>
              <label className={styles.label} htmlFor="cover_image">Cover Image URL（或相對路徑）</label>
              <input className={styles.input} id="cover_image" name="cover_image" placeholder="/uploads/cover.jpg" />
            </div>

            <div>
              <label className={styles.label} htmlFor="cover_image_alt">Cover Image Alt</label>
              <input className={styles.input} id="cover_image_alt" name="cover_image_alt" placeholder="封面圖片描述" />
            </div>

            <div>
              <label className={styles.label} htmlFor="tags">Tags（逗號分隔）</label>
              <input className={styles.input} id="tags" name="tags" placeholder="ai, blog, note" />
            </div>

            <div>
              <label className={styles.label} htmlFor="category">Category</label>
              <input className={styles.input} id="category" name="category" placeholder="journal" />
            </div>

            <div>
              <label className={styles.label} htmlFor="date">Date</label>
              <input className={styles.input} id="date" name="date" type="date" />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_name">地點名稱</label>
              <input className={styles.input} id="location_name" name="location_name" placeholder="例如：某某咖啡廳" />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_address">地點地址</label>
              <input className={styles.input} id="location_address" name="location_address" placeholder="完整地址文字" />
            </div>

            <div>
              <label className={styles.label} htmlFor="location_url">Google Maps URL</label>
              <input className={styles.input} id="location_url" name="location_url" placeholder="https://maps.google.com/..." />
            </div>

            <div>
              <label className={styles.label} htmlFor="status">狀態</label>
              <select className={styles.select} id="status" name="status" defaultValue={POST_STATUS.DRAFT}>
                <option value={POST_STATUS.DRAFT}>draft</option>
                <option value={POST_STATUS.REVIEW}>review</option>
                <option value={POST_STATUS.PUBLISHED}>published</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.button} type="submit">儲存草稿</button>
            <Link href="/" className={styles.button} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              回首頁
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
