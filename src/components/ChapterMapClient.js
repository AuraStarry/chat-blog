"use client";
import dynamic from "next/dynamic";

const ChapterMap = dynamic(() => import("./ChapterMap"), { 
  ssr: false,
  loading: () => <div className="mb-12 aspect-[16/10] bg-slate-100 rounded-3xl animate-pulse" />
});

export default function ChapterMapClient({ locations }) {
  return <ChapterMap locations={locations} />;
}
