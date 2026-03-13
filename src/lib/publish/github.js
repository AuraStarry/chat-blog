/**
 * GitHub API Integration for Git-as-a-CMS
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "AuraStarry";
const GITHUB_REPO = process.env.GITHUB_REPO || "chat-blog";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

/**
 * Fetches the SHA of a file if it exists.
 * Returns null if the file doesn't exist.
 */
async function getFileSha(path) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(`GitHub API Error (get): ${error.message}`);
    }

    const data = await res.json();
    return data.sha;
  } catch (error) {
    console.error("Failed to fetch file SHA:", error);
    throw error;
  }
}

/**
 * Commits a file to GitHub.
 * @param {string} path - Path within the repo (e.g., "content/posts/my-post.md")
 * @param {string} content - Raw file content (text)
 * @param {string} message - Commit message
 */
export async function commitFile({ path, content, message }) {
  if (!GITHUB_TOKEN) {
    throw new Error("Missing GITHUB_TOKEN environment variable.");
  }

  const sha = await getFileSha(path);
  const base64Content = Buffer.from(content).toString("base64");

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: GITHUB_BRANCH,
        sha: sha || undefined,
      }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`GitHub API Error (put): ${error.message}`);
  }

  return await res.json();
}
