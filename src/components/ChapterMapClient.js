"use client";
import { useState, useEffect } from "react";
import ChapterMap from "./ChapterMap";

export default function ChapterMapClient({ locations }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mb-12 aspect-[16/10] min-h-[300px] bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center">
        <span className="text-[10px] text-slate-400">Loading Map...</span>
      </div>
    );
  }

  return <ChapterMap locations={locations} />;
}
