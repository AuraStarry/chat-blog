"use server";

import { saveDraftFromForm } from "@/lib/content/markdown";

export async function createDraftAction(formData) {
  try {
    const password = formData.get("edit_password");
    if (password !== "百變怪") {
      return { error: "AUTH_FAILED", message: "編輯密碼錯誤，存取遭拒。" };
    }

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
    return { success: true, slug: result.slug };
  } catch (e) {
    console.error("Server Action Error:", e);
    return { error: e.message };
  }
}
