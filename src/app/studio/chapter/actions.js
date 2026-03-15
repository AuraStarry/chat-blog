"use server";

import { saveChapter } from "@/lib/content/markdown";

export async function saveChapterAction(formData) {
  try {
    const password = formData.get("edit_password");
    if (password !== "百變怪") {
      return { error: "AUTH_FAILED", message: "編輯密碼錯誤，存取遭拒。" };
    }

    const pagesRaw = String(formData.get("pages") || "");
    const pages = pagesRaw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      summary: formData.get("summary"),
      cover_image: formData.get("cover_image"),
      cover_image_alt: formData.get("cover_image_alt"),
      date: formData.get("date"),
      status: formData.get("status"),
      pages,
      content: formData.get("content"),
    };

    const result = await saveChapter(payload);
    return { success: true, slug: result.slug };
  } catch (e) {
    console.error("Save Chapter Action Error:", e);
    return { error: e.message };
  }
}
