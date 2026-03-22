import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  toAbsoluteUrl,
} from "./site";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toPersonList(leadAuthors) {
  return String(leadAuthors || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      "@type": "Person",
      name,
    }));
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "zh-Hant",
    description: DEFAULT_DESCRIPTION,
  };
}

export function buildPageJsonLd({ slug, frontmatter }) {
  const title = frontmatter.title || "Page";
  const description = frontmatter.summary || DEFAULT_DESCRIPTION;
  const canonical = toAbsoluteUrl(`/page/${slug}`);
  const images = asArray(frontmatter.cover_image || DEFAULT_OG_IMAGE).map((url) =>
    toAbsoluteUrl(url)
  );
  const authors = toPersonList(frontmatter.lead_authors);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    inLanguage: "zh-Hant",
    url: canonical,
    mainEntityOfPage: canonical,
    image: images,
    author: authors.length > 0 ? authors : [{ "@type": "Person", name: "Gore" }],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl(DEFAULT_OG_IMAGE),
      },
    },
    ...(frontmatter.location_name
      ? {
          contentLocation: {
            "@type": "Place",
            name: frontmatter.location_name,
            address: frontmatter.location_address || undefined,
            sameAs: frontmatter.location_url || undefined,
          },
        }
      : {}),
  };
}

export function buildChapterJsonLd({ slug, frontmatter, pages }) {
  const canonical = toAbsoluteUrl(`/chapter/${slug}`);
  const title = frontmatter.title || "Chapter";
  const description =
    frontmatter.summary || `收錄 ${pages.length} 篇 page 的 chapter 精選。`;
  const cover = toAbsoluteUrl(frontmatter.cover_image || DEFAULT_OG_IMAGE);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      inLanguage: "zh-Hant",
      url: canonical,
      image: [cover],
      datePublished: frontmatter.date,
      mainEntity: {
        "@id": `${canonical}#item-list`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${canonical}#item-list`,
      name: `${title} pages`,
      numberOfItems: pages.length,
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: pages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: toAbsoluteUrl(`/page/${page.frontmatter.slug}`),
        name: page.frontmatter.title || `Page ${index + 1}`,
      })),
    },
  ];
}
