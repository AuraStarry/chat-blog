# PROJECT.md — chat-blog

## 專案概述
- **專案名稱**：chat-blog
- **目標**：將 Gore 與奧拉的對話素材（文字、照片）整理為可 review、可發布的 blog 內容。
- **核心方向**：
  - 保留 **Markdown (MD)** 作為最終儲存格式（含 frontmatter + body）
  - 提供 **手機優先的 GUI 共編頁面**，讓使用者不用直接手改 MD 也能完成內容與設定編輯
  - 發布前必須經過共編確認

---

## 已確認需求（已定案）

### 🚀 專案快捷與規範
- **快捷觸發**：`cb` (chat-blog) -> 立即讀取 `PROJECT.md` 與 `EDITING_SKILL.md`。
- **編輯守則**：所有內容生成必須符合 `EDITING_SKILL.md` 之定義。

### 1) 內容流程（Conversation → Draft → Review → Publish）
1. 使用者在對話中提供基本資訊（主題、段落、圖片、補充要求）
2. 系統（奧拉）將內容起草到「共編區域」
3. 每次起草完成後，提供可 review 的對應網誌頁面連結
4. 使用者在共編頁面確認後才可發布

### 2) 編輯體驗
- **手機優先**
- **單欄、專注內容**（不採左中右多欄）
- 以 GUI 編輯內文與設定欄位
- 底層仍由系統寫回 Markdown 檔案

### 3) 圖片策略（v1）
- 暫不做圖片自動解析（省 token）
- 需有 GUI 支援：
  - 選擇/設定 cover image
  - 填寫圖片相關欄位（例如 alt/caption）
- Markdown 中保留對應欄位

### 4) 儲存策略
- **MD 作為基礎儲存格式（SoT）**
- 前台/共編頁不強迫使用者直接編輯 MD 原文
- 系統負責 UI 欄位 ↔ frontmatter/body 同步

### 5) 發布策略
- 發布頻率採 **人工確認後發布**
- 狀態至少區分：`draft` / `review` / `published`

### 6) AI/機器介面（Machine Interface）
- **目標**：提供結構化、無噪音的資料介面，供 LLM/Agent 直接讀取
- **實作路徑**：
  - `/api/content`：吐出所有文章的 metadata 列表（JSON）
  - `/api/content/[slug]`：吐出特定文章的 frontmatter 與內文（JSON）
  - `/api/chapters`：吐出所有「冊」的清單
- **自動化**：每篇文章儲存後，API 即時連動更新

### 7) 冊 (Chapter) 模式 — Play List 內容頁
- **概述**：將多個「單一主題 (Post)」集結成冊，具備排序性的連續內容。
- **呈現形式**：
  - **頂部地圖**：自動打撈冊中所有文章的地點資訊，並在 Map 上插針（針頭樣式為文章標題關鍵字）。
  - **內容清單**：下方為 Collapsed 列表，顯示各篇標題，點擊展開完整內容。
- **存儲**：存放在 `content/chapters/` 目錄，以 MD 紀錄包含的文章 Slug 列表。
- **獨立路由**：`/chapter/[slug]`。

### 8) 延伸需求
- 依不同文章類型套用不同內容規則
- 雙語能力（例如中文主文 + 英文摘要）
- 更進階自動化內容策略

---

## 技術與架構決策（目前）

### 已確認
- 使用者偏好保留 Markdown 以利未來擴充、遷移、版本管理
- 需提供完整 GUI 進行內容與設定編輯（含 cover image）

### 尚未確認（下一階段討論）
- 實際開發環境與框架選型
- 是否/如何參照 `Life-Hiker-Studio` 的 `Agent.md` 架構
- 建置/部署流程與實際主機策略
- 媒體儲存與檔案路徑策略：採用 `chat-blog/public/uploads/` 作為本地媒體存儲目錄。

---

## 目前階段
- **Phase**：功能性骨架開發（Functional Backbone Development）
- **狀態**：✅ 基礎環境、內容讀寫、AI 機器介面、地點與冊 (Chapter) 資料架構已完成。

---

## Next（下一步）
1. **建立文章與冊的預覽頁 (Renderer)**：
   - 實作單篇文章頁面渲染（Markdown -> HTML）。
   - 實作「冊 (Chapter)」頁面渲染（包含 Google Maps 插針與摺疊列表）。
2. **補上發布狀態流轉 (Workflow)**：
   - 在 Studio 增加「提交審閱 (Review)」與「正式發布 (Publish)」的按鈕與邏輯。
   - 實作前台文章列表（僅顯示 `published` 狀態的文章）。
3. **媒體管理器 (Media Picker)**：
   - 實作一個簡單的 UI 讓 Studio 能列出並選擇 `public/uploads` 內的圖片。

---

## 變更紀錄
- 2026-03-01：建立 `chat-blog/PROJECT.md`，整理並凍結目前已確認需求；明確標註暫不建立程式環境，等待下一步架構討論。
- 2026-03-01：完成最小可跑環境初始化（Next.js App Router / JavaScript / Tailwind / ESLint），並加入 `sass`, `gray-matter`, `remark*`, `rehype-stringify`, `zod`, `date-fns`, `slugify` 依賴；建立 `content/posts` 與 `src/lib/content`、`src/lib/publish` 目錄骨架。
- 2026-03-01：完成第一版內容層與共編頁骨架：新增 frontmatter schema、MD 讀寫/儲存 utility、`/studio` 手機單欄 GUI（可儲存 draft 並寫回 `content/posts/<slug>.md`）。
- 2026-03-13：實作「AI/機器介面」規範：新增 `listAllPosts` utility 與 `/api/content`, `/api/content/[slug]` 路由，支援結構化資料打撈；更新 `PROJECT.md` 將機器介面納入核心規格。
- 2026-03-13：完成「地點資訊」與「冊 (Chapter)」模式的資料層實作，包含 Schema 擴充、EDITING_SKILL 更新及相關 API 路由。
