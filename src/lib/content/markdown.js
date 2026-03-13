import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import slugify from "slugify";
import { normalizeFrontmatter, normalizeChapterFrontmatter, POST_STATUS } from "./schema";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

function ensureMdExtension(filename) {
  return filename.endsWith(".md") ? filename : `${filename}.md`;
}

export function normalizeSlug(input) {
  return slugify(String(input || ""), {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function buildDefaultDraft() {
  return {
    title: "",
    slug: "",
    status: POST_STATUS.DRAFT,
    summary: "",
    category: "",
    tags: [],
    cover_image: "",
    cover_image_alt: "",
    date: new Date().toISOString().slice(0, 10),
    content: "",
  };
}

export function toMarkdown({ frontmatter, content }) {
  const normalized = normalizeFrontmatter(frontmatter);
  return matter.stringify(content ?? "", normalized);
}

export async function saveDraftFromForm(input) {
  const slug = normalizeSlug(input.slug || input.title);

  if (!slug) {
    throw new Error("請填寫 title 或 slug");
  }

  const frontmatter = normalizeFrontmatter({
    title: input.title || "未命名草稿",
    slug,
    status: input.status || POST_STATUS.DRAFT,
    summary: input.summary,
    category: input.category,
    tags: input.tags,
    cover_image: input.cover_image,
    cover_image_alt: input.cover_image_alt,
    location_name: input.location_name,
    location_address: input.location_address,
    location_url: input.location_url,
    date: input.date,
  });

  const markdown = toMarkdown({
    frontmatter,
    content: input.content || "",
  });

  await fs.mkdir(POSTS_DIR, { recursive: true });
  const filePath = path.join(POSTS_DIR, ensureMdExtension(slug));
  await fs.writeFile(filePath, markdown, "utf8");

  return {
    slug,
    filePath,
  };
}

export async function readPostBySlug(slug) {
  const filePath = path.join(POSTS_DIR, ensureMdExtension(slug));
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  return {
    frontmatter: normalizeFrontmatter(parsed.data),
    content: parsed.content,
  };
}

export async function listAllPosts() {
  await fs.mkdir(POSTS_DIR, { recursive: true });
  const files = await fs.readdir(POSTS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (f) => {
      const slug = f.replace(".md", "");
      const raw = await fs.readFile(path.join(POSTS_DIR, f), "utf8");
      const { data } = matter(raw);
      return {
        ...normalizeFrontmatter(data),
        slug, // Ensure slug matches filename
      };
    })
  );

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// --- Chapter Logic ---

export async function saveChapter(input) {
  const slug = normalizeSlug(input.slug || input.title);
  const frontmatter = normalizeChapterFrontmatter({
    title: input.title,
    slug,
    status: input.status || POST_STATUS.DRAFT,
    date: input.date || new Date().toISOString().slice(0, 10),
    posts: input.posts || [],
  });

  const markdown = matter.stringify(input.content || "", frontmatter);
  await fs.mkdir(CHAPTERS_DIR, { recursive: true });
  const filePath = path.join(CHAPTERS_DIR, ensureMdExtension(slug));
  await fs.writeFile(filePath, markdown, "utf8");

  return { slug, filePath };
}

export async function readChapterBySlug(slug) {
  const filePath = path.join(CHAPTERS_DIR, ensureMdExtension(slug));
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  const frontmatter = normalizeChapterFrontmatter(parsed.data);
  
  // Also fetch the full content of each linked post
  const postsData = await Promise.all(
    frontmatter.posts.map(async (postSlug) => {
      try {
        return await readPostBySlug(postSlug);
      } catch (e) {
        return null; // Skip if post not found
      }
    })
  );

  return {
    frontmatter,
    content: parsed.content,
    posts: postsData.filter(Boolean),
  };
}
