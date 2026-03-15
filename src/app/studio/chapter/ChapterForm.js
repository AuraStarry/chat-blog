"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import styles from "../page.module.scss";

export default function ChapterForm({ initialData, allPages, saveAction, pageStatusConstants }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [selectedPages, setSelectedPages] = useState(initialData.pages || []);

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

  const selectedSet = useMemo(() => new Set(selectedPages), [selectedPages]);

  const candidatePages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPages.slice(0, 12);

    return allPages
      .filter((page) => {
        const title = String(page.title || "").toLowerCase();
        const slug = String(page.slug || "").toLowerCase();
        return title.includes(q) || slug.includes(q);
      })
      .slice(0, 20);
  }, [allPages, query]);

  function addPage(slug) {
    if (!slug || selectedSet.has(slug)) return;
    setSelectedPages((prev) => [...prev, slug]);
  }

  function removePage(slug) {
    setSelectedPages((prev) => prev.filter((item) => item !== slug));
  }

  function movePage(slug, direction) {
    setSelectedPages((prev) => {
      const currentIndex = prev.indexOf(slug);
      if (currentIndex < 0) return prev;

      const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const cloned = [...prev];
      [cloned[currentIndex], cloned[nextIndex]] = [cloned[nextIndex], cloned[currentIndex]];
      return cloned;
    });
  }

  async function handleSubmit(formData) {
    setIsSaving(true);
    setSaveMessage("");
    setError("");

    formData.set("edit_password", password);
    formData.set("pages", selectedPages.join(","));

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
        setSaveMessage("Chapter 儲存成功！Git Commit 已送出，Vercel 正在部署中（約需 1-2 分鐘生效）。");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setError("儲存失敗：" + e.message);
    } finally {
      setIsSaving(false);
    }
  }

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
            <label className={styles.label} htmlFor="title">Chapter 主題</label>
            <input className={styles.input} id="title" name="title" placeholder="例如：魚沼米飯之旅" required defaultValue={initialData.title} />
          </div>

          <div>
            <label className={styles.label} htmlFor="slug">Slug（唯讀）</label>
            <input className={styles.input} id="slug" name="slug" placeholder="uonuma-rice-journey" defaultValue={initialData.slug} readOnly />
            <p className={styles.note} style={{ marginTop: "4px" }}>目前暫不支援變更 Slug。</p>
          </div>

          <div>
            <label className={styles.label} htmlFor="summary">摘要</label>
            <textarea className={styles.textarea} id="summary" name="summary" placeholder="這本冊子的核心主題" defaultValue={initialData.summary} />
          </div>

          <div>
            <label className={styles.label} htmlFor="cover_image">Cover Image URL</label>
            <input className={styles.input} id="cover_image" name="cover_image" placeholder="/uploads/chapter/cover.jpg" defaultValue={initialData.cover_image} />
          </div>

          <div>
            <label className={styles.label} htmlFor="cover_image_alt">Cover Image Alt</label>
            <input className={styles.input} id="cover_image_alt" name="cover_image_alt" placeholder="封面圖片描述" defaultValue={initialData.cover_image_alt} />
          </div>

          <div>
            <label className={styles.label} htmlFor="date">Date</label>
            <input className={styles.input} id="date" name="date" type="date" defaultValue={initialData.date} />
          </div>

          <div>
            <label className={styles.label} htmlFor="status">狀態</label>
            <select className={styles.select} id="status" name="status" defaultValue={initialData.status}>
              <option value={pageStatusConstants.DRAFT}>draft</option>
              <option value={pageStatusConstants.REVIEW}>review</option>
              <option value={pageStatusConstants.PUBLISHED}>published</option>
            </select>
          </div>

          <div>
            <label className={styles.label}>追加 Page</label>
            <input
              className={styles.input}
              placeholder="輸入 page title 或 slug 搜尋"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {candidatePages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  className={styles.button}
                  onClick={() => addPage(page.slug)}
                  disabled={selectedSet.has(page.slug)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    opacity: selectedSet.has(page.slug) ? 0.4 : 1,
                  }}
                  title={page.title}
                >
                  + {page.slug}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={styles.label}>Chapter Pages（順序即顯示順序）</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedPages.length === 0 ? (
                <p className={styles.note}>尚未加入任何 page。</p>
              ) : (
                selectedPages.map((slug, idx) => {
                  const meta = allPages.find((p) => p.slug === slug);
                  const pageTitle = meta?.title || slug;
                  return (
                    <div key={slug} style={{ border: "1px solid #27272a", borderRadius: 10, padding: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#a1a1aa", minWidth: 24 }}>{String(idx + 1).padStart(2, "0")}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{pageTitle}</div>
                        <div style={{ fontSize: 12, color: "#71717a" }}>{slug}</div>
                      </div>
                      <button type="button" className={styles.button} onClick={() => movePage(slug, "up")} style={{ padding: "6px 8px", fontSize: 12 }}>↑</button>
                      <button type="button" className={styles.button} onClick={() => movePage(slug, "down")} style={{ padding: "6px 8px", fontSize: 12 }}>↓</button>
                      <button type="button" className={styles.button} onClick={() => removePage(slug)} style={{ padding: "6px 8px", fontSize: 12, background: "#7f1d1d", color: "#fee2e2" }}>移除</button>
                    </div>
                  );
                })
              )}
            </div>
            <input type="hidden" name="pages" value={selectedPages.join(",")} readOnly />
          </div>

          <div>
            <label className={styles.label} htmlFor="content">備註（Markdown，可空）</label>
            <textarea className={styles.textarea} id="content" name="content" placeholder="可記錄這本 chapter 的前言、策展想法等。" defaultValue={initialData.content} />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.button} type="submit" disabled={isSaving}>
            {isSaving ? "正在儲存..." : "儲存 Chapter"}
          </button>

          {initialData.slug && (
            <a
              href={`/chapter/${initialData.slug}`}
              target="_blank"
              className={styles.button}
              style={{ background: "#27272a", color: "#fafafa", border: "1px solid #3f3f46" }}
            >
              預覽 Chapter ↗
            </a>
          )}

          <Link href="/studio" className={styles.button} style={{ background: "transparent", color: "#a1a1aa", border: "1px solid #27272a" }}>
            返回 Page Studio
          </Link>
        </div>
      </form>
    </>
  );
}
