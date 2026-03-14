"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PrivateDrafts({ posts }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const password = localStorage.getItem("studio_password");
    // 檢查是否為中文三個字
    if (password && /^[\u4e00-\u9fa5]{3}$/.test(password)) {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated || posts.length === 0) return null;

  return (
    <div className="space-y-8 pt-12 border-t border-zinc-200">
      <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Drafts (Private)</h2>
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/post/${post.slug}`}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 transition-colors shadow-sm"
          >
            <div>
              <h4 className="font-bold text-zinc-800">{post.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">{post.date} · {post.status}</p>
            </div>
            <span className="text-zinc-300">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
