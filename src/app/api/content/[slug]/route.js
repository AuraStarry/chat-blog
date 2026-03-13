import { NextResponse } from "next/server";
import { readPostBySlug } from "@/lib/content/markdown";

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const post = await readPostBySlug(slug);
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json(
      { error: `Post not found: ${slug}`, details: error.message },
      { status: 404 }
    );
  }
}
