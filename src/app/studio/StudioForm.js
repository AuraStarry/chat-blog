"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.scss";

export default function StudioForm({ initialData, saveAction, postStatusConstants }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let stored = localStorage.getItem("studio_password");
    if (!stored) {
      stored = prompt("請輸入編輯密碼：");
      if (stored) {
        localStorage.setItem("studio_password", stored);
      }
    }
    setPassword(stored || "");
  }, []);

  async function handleSubmit(formData) {
    setIsSaving(true);
    setSaveMessage("");
    setError("");

    // Append password to formData
    formData.set("edit_password", password);

    try {
      const result = await saveAction(formData);
      if (result?.error) {
        if (result.error === "AUTH_FAILED") {
          localStorage.removeItem("studio_password");
          alert(result.message || "驗證失敗，請重試。");
          window.location.reload();
          return;
        }
        setError(result.message || result.error);
      } else {
        setSaveMessage("儲存成功！Git Commit 已送出，Vercel 正在部署中...");
        // Clear message after 5 seconds
        setTimeout(() => setSaveMessage(""), 5000);
      }
    } catch (e) {
      setError("儲存失敗：" + e.message);
    } finally {
      setIsSaving(false);
    }
  }

  // If no password, don't show the form (it will prompt in useEffect)
  if (typeof window !== "undefined" && !password && !localStorage.getItem("studio_password")) {
    return (
      <div className={styles.card} style={{ textAlign: "center", padding: "40px" }}>
        <p>需要編輯密碼才能繼續。</p>
        <button className={styles.button} onClick={() => window.location.reload()}>重新輸入</button>
      </div>
    );
  }

  return (
    <>
      {saveMessage && (
        <div className={styles.card} style={{ background: "#065f46", border: "1px solid #059669", color: "#ecfdf5" }}>
          {saveMessage}
        </div>
      )}

      {error && (
        <div className={styles.card} style={{ background: "#991b1b", border: "1px solid #dc2626", color: "#fef2f2" }}>
          {error}
        </div>
      )}

      <form className={styles.card} action={handleSubmit}>
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
              <option value={postStatusConstants.DRAFT}>draft</option>
              <option value={postStatusConstants.REVIEW}>review</option>
              <option value={postStatusConstants.PUBLISHED}>published</option>
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={isSaving}>
            {isSaving ? "正在儲存..." : "儲存變更"}
          </button>
          <Link href="/" className={styles.button} style={{ background: "transparent", color: "#a1a1aa", border: "1px solid #27272a" }}>
            返回首頁
          </Link>
        </div>
      </form>
    </>
  );
}
