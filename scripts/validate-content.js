import { listAllPosts } from "../src/lib/content/markdown.js";
import { normalizeFrontmatter } from "../src/lib/content/schema.js";

async function validate() {
  console.log("🔍 開始驗證內容規格...");
  try {
    const posts = await listAllPosts();
    console.log(`✅ 成功讀取 ${posts.length} 篇文章。`);
    
    for (const post of posts) {
      try {
        normalizeFrontmatter(post);
        console.log(`  - [PASS] ${post.slug}`);
      } catch (e) {
        console.error(`  - [FAIL] ${post.slug}: 格式不符合 Zod Schema`);
        console.error(e.errors || e.message);
        process.exit(1);
      }
    }
    console.log("\n✨ 所有內容皆符合規格！");
  } catch (error) {
    console.error("❌ 驗證過程中發生錯誤：", error.message);
    process.exit(1);
  }
}

validate();
