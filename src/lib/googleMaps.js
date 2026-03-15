const REDIRECT_HOSTS = new Set([
  "maps.app.goo.gl",
  "goo.gl",
]);

function buildQuery(locationName = "", locationAddress = "") {
  return [locationName, locationAddress].filter(Boolean).join(" ").trim();
}

export function buildGoogleMapsSearchUrl(locationName = "", locationAddress = "") {
  const query = buildQuery(locationName, locationAddress);
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function normalizeGoogleMapsUrl(rawUrl = "", locationName = "", locationAddress = "") {
  const fallback = buildGoogleMapsSearchUrl(locationName, locationAddress);
  if (!rawUrl) return fallback;

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase();

    if (REDIRECT_HOSTS.has(host)) {
      return fallback || rawUrl;
    }

    return rawUrl;
  } catch {
    return fallback || "";
  }
}
