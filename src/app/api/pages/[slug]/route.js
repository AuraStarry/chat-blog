import { NextResponse } from "next/server";
import { readPageBySlug } from "@/lib/content/markdown";

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const page = await readPageBySlug(slug);
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json(
      { error: `Page not found: ${slug}`, details: error.message },
      { status: 404 }
    );
  }
}
