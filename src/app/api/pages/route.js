import { NextResponse } from "next/server";
import { listAllPages } from "@/lib/content/markdown";

export async function GET() {
  try {
    const pages = await listAllPages();
    return NextResponse.json({
      total: pages.length,
      pages,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pages", details: error.message },
      { status: 500 }
    );
  }
}
