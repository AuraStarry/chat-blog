import { NextResponse } from "next/server";
import { listAllChapters } from "@/lib/content/markdown";

export async function GET() {
  try {
    const chapters = await listAllChapters();

    return NextResponse.json({
      total: chapters.length,
      chapters,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chapters", details: error.message },
      { status: 500 }
    );
  }
}
