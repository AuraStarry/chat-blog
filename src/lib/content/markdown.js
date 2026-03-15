import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import slugify from "slugify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { normalizeFrontmatter, normalizeChapterFrontmatter, PAGE_STATUS } from "./schema.js";
import { commitFile } from "../publish/github.js";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");
const LEGACY_POSTS_DIR = path.join(process.cwd(), "content", "posts");
const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

const IS_GIT_CMS = !!process.env.GITHUB_TOKEN;

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
    status: PAGE_STATUS.DRAFT,
    summary: "",
    category: "",
    tags: [],
    cover_image: "",
    cover_image_alt: "",
    date: new Date().toISOString().slice(0, 10),
    content: "",
  };
}

export async function renderMarkdown(content) {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content || "");
  return processed.toString();
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
    status: input.status || PAGE_STATUS.DRAFT,
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

  const relativePath = `content/pages/${ensureMdExtension(slug)}`;

  if (IS_GIT_CMS) {
    await commitFile({
      path: relativePath,
      content: markdown,
      message: `studio: save page "${frontmatter.title}"`,
    });
  } else {
    await fs.mkdir(PAGES_DIR, { recursive: true });
    const filePath = path.join(PAGES_DIR, ensureMdExtension(slug));
    await fs.writeFile(filePath, markdown, "utf8");
  }

  return {
    slug,
    path: relativePath,
  };
}

async function resolvePageFilePath(slug) {
  const mdName = ensureMdExtension(slug);
  const currentPath = path.join(PAGES_DIR, mdName);
  try {
    await fs.access(currentPath);
    return currentPath;
  } catch {
    const legacyPath = path.join(LEGACY_POSTS_DIR, mdName);
    await fs.access(legacyPath);
    return legacyPath;
  }
}

export async function readPageBySlug(slug) {
  const filePath = await resolvePageFilePath(slug);
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  return {
    frontmatter: normalizeFrontmatter(parsed.data),
    content: parsed.content,
  };
}

export async function listAllPages() {
  await fs.mkdir(PAGES_DIR, { recursive: true });
  await fs.mkdir(LEGACY_POSTS_DIR, { recursive: true });

  const [pageFiles, legacyFiles] = await Promise.all([
    fs.readdir(PAGES_DIR),
    fs.readdir(LEGACY_POSTS_DIR),
  ]);

  const allMdFiles = [...new Set([...pageFiles, ...legacyFiles])].filter((f) =>
    f.endsWith(".md")
  );

  const pages = await Promise.all(
    allMdFiles.map(async (f) => {
      const slug = f.replace(".md", "");
      const filePath = await resolvePageFilePath(slug);
      const raw = await fs.readFile(filePath, "utf8");
      const { data } = matter(raw);
      return {
        ...normalizeFrontmatter(data),
        slug,
      };
    })
  );

  return pages.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// --- Chapter Logic ---

export async function saveChapter(input) {
  const slug = normalizeSlug(input.slug || input.title);
  const frontmatter = normalizeChapterFrontmatter({
    title: input.title,
    slug,
    status: input.status || PAGE_STATUS.DRAFT,
    summary: input.summary,
    cover_image: input.cover_image,
    cover_image_alt: input.cover_image_alt,
    date: input.date || new Date().toISOString().slice(0, 10),
    pages: input.pages || input.posts || [],
  });

  const markdown = matter.stringify(input.content || "", frontmatter);
  const relativePath = `content/chapters/${ensureMdExtension(slug)}`;

  if (IS_GIT_CMS) {
    await commitFile({
      path: relativePath,
      content: markdown,
      message: `studio: save chapter "${frontmatter.title}"`,
    });
  } else {
    await fs.mkdir(CHAPTERS_DIR, { recursive: true });
    const filePath = path.join(CHAPTERS_DIR, ensureMdExtension(slug));
    await fs.writeFile(filePath, markdown, "utf8");
  }

  return { slug, path: relativePath };
}

export async function readChapterBySlug(slug) {
  const filePath = path.join(CHAPTERS_DIR, ensureMdExtension(slug));
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = matter(raw);

  const frontmatter = normalizeChapterFrontmatter(parsed.data);

  const pagesData = await Promise.all(
    frontmatter.pages.map(async (pageSlug) => {
      try {
        return await readPageBySlug(pageSlug);
      } catch (e) {
        return null;
      }
    })
  );

  return {
    frontmatter,
    content: parsed.content,
    pages: pagesData.filter(Boolean),
  };
}

export async function listAllChapters() {
  await fs.mkdir(CHAPTERS_DIR, { recursive: true });
  const files = await fs.readdir(CHAPTERS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const chapters = await Promise.all(
    mdFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(CHAPTERS_DIR, filename), "utf8");
      const parsed = matter(raw);
      return normalizeChapterFrontmatter(parsed.data);
    })
  );

  return chapters.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Backward-compatible aliases
export const POST_STATUS = PAGE_STATUS;
export const readPostBySlug = readPageBySlug;
export const listAllPosts = listAllPages;
