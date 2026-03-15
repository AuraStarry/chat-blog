import { listAllPages } from "../src/lib/content/markdown.js";
import { normalizeFrontmatter } from "../src/lib/content/schema.js";

async function validate() {
  console.log("🔍 開始驗證內容規格...");
  try {
    const pages = await listAllPages();
    console.log(`✅ 成功讀取 ${pages.length} 篇內容。`);
    
    for (const page of pages) {
      try {
        normalizeFrontmatter(page);
        console.log(`  - [PASS] ${page.slug}`);
      } catch (e) {
        console.error(`  - [FAIL] ${page.slug}: 格式不符合 Zod Schema`);
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
