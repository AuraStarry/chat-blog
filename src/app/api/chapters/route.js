import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { normalizeChapterFrontmatter } from "@/lib/content/schema";

const CHAPTERS_DIR = path.join(process.cwd(), "content", "chapters");

export async function GET() {
  try {
    await fs.mkdir(CHAPTERS_DIR, { recursive: true });
    const files = await fs.readdir(CHAPTERS_DIR);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const chapters = await Promise.all(
      mdFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(CHAPTERS_DIR, f), "utf8");
        const { data } = matter(raw);
        return normalizeChapterFrontmatter(data);
      })
    );

    return NextResponse.json({
      total: chapters.length,
      chapters: chapters.sort((a, b) => new Date(b.date) - new Date(a.date)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chapters", details: error.message },
      { status: 500 }
    );
  }
}
