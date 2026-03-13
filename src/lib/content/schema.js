import { z } from "zod";

export const POST_STATUS = {
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

export const postFrontmatterSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  slug: z.string().trim().min(1, "slug is required"),
  status: z.enum([POST_STATUS.DRAFT, POST_STATUS.REVIEW, POST_STATUS.PUBLISHED]),
  summary: z.string().trim().default(""),
  category: z.string().trim().default(""),
  tags: coerceStringArray.default([]),
  cover_image: z.string().trim().default(""),
  cover_image_alt: z.string().trim().default(""),
  date: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, z.string().trim().default("")),
  location_name: z.string().trim().default(""),
  location_address: z.string().trim().default(""),
  location_url: z.string().trim().default(""),
});

export function normalizeFrontmatter(input) {
  return postFrontmatterSchema.parse(input);
}

export const chapterFrontmatterSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  slug: z.string().trim().min(1, "slug is required"),
  status: z.enum([POST_STATUS.DRAFT, POST_STATUS.REVIEW, POST_STATUS.PUBLISHED]),
  date: z.preprocess((val) => {
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val;
  }, z.string().trim().default("")),
  posts: z.array(z.string()).default([]), // List of post slugs
});

export function normalizeChapterFrontmatter(input) {
  return chapterFrontmatterSchema.parse(input);
}
