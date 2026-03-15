import { z } from "zod";

export const PAGE_STATUS = {
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
};

const coerceStringArray = z
  .union([z.array(z.string()), z.string(), z.undefined()])
  .transform((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  });

const dateCoerce = z.preprocess((val) => {
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "string") return val.split("T")[0];
  return val;
}, z.string().trim().default(""));

export const pageFrontmatterSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  slug: z.string().trim().min(1, "slug is required"),
  status: z.enum([PAGE_STATUS.DRAFT, PAGE_STATUS.REVIEW, PAGE_STATUS.PUBLISHED]),
  summary: z.string().trim().default(""),
  category: z.string().trim().default(""),
  tags: coerceStringArray.default([]),
  cover_image: z.string().trim().default(""),
  cover_image_alt: z.string().trim().default(""),
  date: dateCoerce,
  location_name: z.string().trim().default(""),
  location_address: z.string().trim().default(""),
  location_url: z.string().trim().default(""),
});

export function normalizeFrontmatter(input) {
  return pageFrontmatterSchema.parse(input);
}

export const chapterFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1, "title is required"),
    slug: z.string().trim().min(1, "slug is required"),
    status: z.enum([PAGE_STATUS.DRAFT, PAGE_STATUS.REVIEW, PAGE_STATUS.PUBLISHED]),
    date: dateCoerce,
    pages: z.array(z.string()).default([]),
    posts: z.array(z.string()).optional(),
  })
  .transform((data) => ({
    title: data.title,
    slug: data.slug,
    status: data.status,
    date: data.date,
    pages: data.pages.length > 0 ? data.pages : data.posts || [],
  }));

export function normalizeChapterFrontmatter(input) {
  return chapterFrontmatterSchema.parse(input);
}

// Backward-compatible aliases
export const POST_STATUS = PAGE_STATUS;
export const postFrontmatterSchema = pageFrontmatterSchema;
