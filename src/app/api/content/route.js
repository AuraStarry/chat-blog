import { NextResponse } from "next/server";
import { listAllPosts } from "@/lib/content/markdown";

export async function GET() {
  try {
    const posts = await listAllPosts();
    return NextResponse.json({
      total: posts.length,
      posts,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}
