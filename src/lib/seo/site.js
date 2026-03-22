export const SITE_URL = "https://chat-blog-silk.vercel.app";
export const SITE_NAME = "高黑的冒險筆記";
export const DEFAULT_TITLE = "高黑的冒險筆記 | Gore & Hazel shared digital garden";
export const DEFAULT_DESCRIPTION =
  "探索 Gore 與 Hazel 的數位花園：精選已發布 pages 與主題 chapter。";
export const DEFAULT_OG_IMAGE = "/og-default.svg";

export function toAbsoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
