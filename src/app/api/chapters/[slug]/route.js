import { NextResponse } from "next/server";
import { readChapterBySlug } from "@/lib/content/markdown";

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const chapter = await readChapterBySlug(slug);
    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json(
      { error: `Chapter not found: ${slug}`, details: error.message },
      { status: 404 }
    );
  }
}
