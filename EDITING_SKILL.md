# EDITING_SKILL — chat-blog 編輯規範

這是針對 `chat-blog` 內容起草與編輯的專屬技能規範。任何 Agent 在處理此專案的文章內容時，必須遵循以下規則。

---

## 0. 規範分層（全域 + 個人）
- `EDITING_SKILL.md` 是**全域共通規範**（專案級）。
- 個人風格規範放在：
  - `editing-profiles/gore.md`
  - `editing-profiles/hazel.md`
- 內容草稿若有 `author` 欄位，應載入對應 profile；無 `author` 時僅套用全域規範。

### 0.1 優先序與衝突處理
1. 全域硬規則（本檔）
2. 個人 profile（僅補充風格）

若兩者衝突，以全域硬規則為準。

### 0.2 異動前確認（必要）
當 Gore 提出「要改 editing 規範」但範圍未明確時，Agent 必須先主動確認：
- 這次修改是 **全域專案規範**（`EDITING_SKILL.md`）
- 還是 **個人風格規範**（`editing-profiles/<author>.md`）

未釐清範圍前，不得直接改寫規範內容。

---

## 1. 內容轉換原則（從對話到文章）
- **去蕪存菁**：將 Gore 的對話口語轉化為書面但具溫度的文字。保留核心觀點，剔除贅詞。
- **結構化排版**：
  - **H1 (Title)**：文章主標題。
  - **H2**：主要章節。
  - **H3**：章節內的小重點。
  - **粗體**：用於強調關鍵句或重要結論。
- **段落長度**：手機閱讀優先，段落不宜過長（建議每段 3-5 行）。

## 2. Frontmatter 規範
- **title**：吸睛且精確。
- **2.1 主題錨定 (Topic Anchoring)**：
  - 當 Gore 在對話中明確提到「主題是...」或「標題定為...」時，Agent 必須立即鎖定該 `title` 作為當前編輯的核心索引。
  - 若對話中尚未明確標題，Agent 應主動根據內容提煉一個暫時標題，並在回應中詢問確認。
  - 標題一旦確立，後續的所有素材添加（照片、地點、內文）皆應關聯至該標題對應的 Draft 檔案中。
- **slug**：僅限小寫英文、數字與連字號 `-`（由系統自動產生，但 Agent 需確保 title 可轉化為有意義的 slug）。
- **summary**：100 字以內的摘要，需包含核心關鍵字以利 AI 打撈。
- **status**：預設為 `published`。
- **author**：可選；若填寫，僅允許 `gore` 或 `hazel`，用於套用對應個人 profile。
- **lead_authors（主筆人）**：文字欄位，顯示於 page 內容頁，支援自由輸入與複數（例如 `Gore, Hazel`）。
  - 新建 page 時，若未提供 `lead_authors`，預設需依創建 page 的 agent 自動填入：`gore → Gore`、`hazel → Hazel`。
  - 若無法判斷 agent，預設填 `Gore`。
  - 為兼容舊資料，若舊文僅有 `author: gore/hazel` 且無 `lead_authors`，可對應顯示為 `Gore/Hazel`。
- **date**：使用 `YYYY-MM-DD` 格式。**務必加上單引號包裹**（例如 `'2026-03-13'`），防止 YAML 解析器將其誤認為 Date 物件而導致系統崩潰。

## 8. 穩定性防禦（穩定規格關鍵）
為確保不同型號的 Agent 都能產出符合規格的內容，請遵循以下檢查：
1. **Schema 優先**：在寫入檔案前，對照 `src/lib/content/schema.js` 確認欄位類型。
2. **防呆格式**：
   - 所有日期字串必須加引號。
   - Tags 若為陣列，在 Markdown 中建議使用 YAML 列表格式或逗號分隔字串（系統會自動轉換）。
3. **本地驗證**：完成寫入後，嘗試讀取該 `slug` 的 API 或執行 `node scripts/validate-content.js`（若存在）進行驗證。

## 3. 圖片處理
- **儲存位置**：所有與文章相關的圖片必須存放在 `chat-blog/public/uploads/{slug}/` 目錄下（若 slug 未定，則暫存於 `uploads/` 並在確定標題後移動）。
- **檔案命名**：建議使用序號或描述，例如 `01.jpg`, `ticket-box.jpg`。
- **引用路徑**：在 Markdown 或 Frontmatter 中，使用相對於 public 的完整路徑，例如 `/uploads/my-page-slug/01.jpg`。
- **Cover Image**：若對話中有提到圖片，Agent 需在 frontmatter 預留 `cover_image` 位置，並在 `cover_image_alt` 寫下描述。
- **內文圖片**：使用標準 Markdown 語法 `![alt](url)`，並附帶簡單的圖說（caption）。**注意：若首張內文圖片與 `cover_image` 相同，則內文中不應重複放置該圖片，以避免頁面頂部重複顯示。**

## 4. 地點與地標 (Places / POI) 資訊處理
- **精確檢索**：若內容提及特定店家、名勝古蹟、或任何地圖上的「地標 (Place)」，Agent 必須使用 `web_search` 查找該地點的：
  - **正式地標名稱 (Place Name)**：確保為 Google Maps 上註冊的正式名稱。
  - **Google Maps 連結**：禁止使用 `maps.app.goo.gl`、`goo.gl/maps` 等短網址轉導連結；請使用可直接開啟的正式連結（建議 `https://www.google.com/maps/search/?api=1&query=...` 或 `https://www.google.com/maps/place/...`）。
  - **完整地址**：用於輔助顯示。
- **欄位存儲**：將資訊填入 frontmatter：
  - `location_name`: 地標正式名稱。
  - `location_address`: 實際地址。
  - `location_url`: Google Maps 連結。
- **編輯輔助**：Agent 在起草內容時，必須確保 `location_name` 的精確度，因為這會直接影響地圖嵌入 (Embed) 的搜尋成功率。

## 5. 「冊 (Chapter)」模式編輯
- **集結成冊**：當 Gore 要求「將這幾篇集結成冊」或「建立一個關於...的 Chapter」時，Agent 需建立一個 Chapter MD。
- **順序維護**：Agent 需根據對話邏輯（如時間序或 Gore 指定的順序）排列 `pages` 列表。
- **資料彙整**：建立 Chapter 時，應確保關聯的文章已經存在。

## 6. 編輯風格 (Voice & Tone)
- **風格**：簡潔、現代、帶有思考深度。
- **禁忌**：不使用過度說教的語氣，不使用過時的網路流行語。
- **技術名詞**：英文術語保持原文，首字母視情境大寫。

## 7. Agent 工作流程
1. **讀取素材**：獲取對話紀錄中的原始素材。
2. **鎖定主題**：優先確認文章主題（Title），建立與 Gore 的共識索引。
3. **結構配置**：依據此規範規劃標題與章節。
4. **起草 Draft**：調用 `saveDraftFromForm` 寫入 `content/pages/`。
5. **完成後 Git 同步（必要）**：只要有內容或資產異動，必須在驗證通過後執行 `git add`、`git commit`、`git push`，確保遠端與部署可見；不得僅停留在本地變更。
6. **回報連結**：必須回傳可直接點擊的正式站完整網址，不可只回傳相對路徑。當前正式站網域為 `https://chat-blog-silk.vercel.app/`，例如：
   - `https://chat-blog-silk.vercel.app/studio?saved={slug}`
   - `https://chat-blog-silk.vercel.app/page/{slug}`

---

> *此規範由 Gore 與奧拉共同制定，異動需經過雙方確認。*
