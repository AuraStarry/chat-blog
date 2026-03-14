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
- **部署策略**：部署於 Vercel，採用 **Git-as-a-CMS** 架構。
- **儲存機制**：Studio 透過 GitHub API 直接對 Repo 進行 Commit，觸發 Vercel 自動部署。
- **媒體存儲**：採用 `chat-blog/public/uploads/` 作為本地媒體存儲目錄。

### 尚未確認（下一階段討論）
- 是否導入更進階的內容預覽（Deploy Previews）
- 媒體上傳是否需要串接外部 Storage（如 Cloudinary/Vercel Blob）以避免 Repo 過大

---

## 目前階段
- **Phase**：功能性骨架開發 (Functional Backbone Development)
- **狀態**：✅ 基礎環境、內容讀寫、Markdown 渲染、AI 機器介面、地點與冊 (Chapter) 資料架構已完成；🚀 正在優化 Studio 編輯體驗與內容管理規範。

---

## Next（下一步）
1. **地圖功能強化**：
   - [ ] 串接正式 Google Maps API Key（目前為預留區塊）。
   - [ ] 在 Chapter 頁面實現互動式地圖（Mapbox 或 Google Maps JS SDK）。
2. **內容組織優化 (Folder-per-Post)**：
   - [ ] 實作圖片儲存重構：未來新文章的圖片需存放在 `public/uploads/{slug}/` 資料夾下，而非散落在 `uploads/` 根目錄。
   - [ ] 更新 `EDITING_SKILL.md` 規範 Agent 在起草時自動建立對應資料夾並移動檔案。

---

## 變更紀錄
- 2026-03-01：建立 `chat-blog/PROJECT.md`，整理並凍結目前已確認需求；明確標註暫不建立程式環境，等待下一步架構討論。
- 2026-03-01：完成最小可跑環境初始化（Next.js App Router / JavaScript / Tailwind / ESLint），並加入 `sass`, `gray-matter`, `remark*`, `rehype-stringify`, `zod`, `date-fns`, `slugify` 依賴；建立 `content/posts` 與 `src/lib/content`、`src/lib/publish` 目錄骨架。
- 2026-03-01：完成第一版內容層與共編頁骨架：新增 frontmatter schema、MD 讀寫/儲存 utility、`/studio` 手機單欄 GUI（可儲存 draft 並寫回 `content/posts/<slug>.md`）。
- 2026-03-13：實作「AI/機器介面」規範：新增 `listAllPosts` utility 與 `/api/content`, `/api/content/[slug]` 路由，支援結構化資料打撈；更新 `PROJECT.md` 將機器介面納入核心規格。
- 2026-03-13：修復 `/studio` 路由 404 問題（重新命名目錄並移除 Route Group 衝突）；實作 Studio 頁面的草稿讀取功能，支援透過 `?saved=slug` 載入現有內容進行編輯。
- 2026-03-13：優化 Post 頁面排版：移除作者欄、精簡標題區塊、修正 Summary 重複顯示問題、增加 Google Maps Embed 預留區塊。同時更新 `EDITING_SKILL.md`，將地點統一規範為「地標 (Place / POI)」，要求 Agent 必須搜尋精確的正式名稱與 Google Maps 分享連結。
- 2026-03-13：實作 Markdown 渲染引擎。整合 `remark-gfm`, `remark-breaks` 與 `rehype-stringify`；支援 GFM 與強制換行，並套用 Tailwind Typography (Prose) 樣式。
- 2026-03-13：新增文章 `ishiuchi-station-quiet-moments`。實作對話素材轉化流程：自動搬移圖片至 `public/uploads/`、檢索 Google Maps 地標資訊、並依據 `EDITING_SKILL.md` 起草 Draft。
- 2026-03-14：新增文章 `osawa-station-shuttle-and-fare-proof`。記錄里山十帖的大澤站接駁與無人車站乘車證明領取流程。更新 PROJECT.md 並完成 Git 同步。
- 2026-03-14：優化編輯規範。更新 `EDITING_SKILL.md` 要求若首圖與 Cover 相同則內文不重複放置；已同步重構 `ishiuchi-station-quiet-moments` 與 `osawa-station-shuttle-and-fare-proof` 以維持排版簡潔。
- 2026-03-14：實作首頁私有草稿列表過濾。現在首頁會檢查 `localStorage` 中的 `studio_password` 是否為三個中文漢字，否則隱藏 Drafts 列表。
- 2026-03-14：Studio UI 優化與規範更新。修正 Dark Mode 下「預覽文章」按鈕字體不可見問題；確認放棄「發布流轉按鈕」與「媒體管理器 UI」需求，改採「Slug 資料夾化」圖片儲存規範。更新 PROJECT.md 與下一步。
- 2026-03-14：實作首個 Chapter「魚沼米飯之旅」。建立 `content/chapters/` 目錄與資料讀取邏輯；開發前台 Chapter 頁面之自定義地圖插針功能，支持點擊插針跳轉至對應文章，並在懸浮時顯示文章標題。
- 2026-03-14：重構 ChapterMap 為 Client Component。修正手機版懸浮標題重疊與互動問題，改為「點擊插針後顯示資訊卡片」；資訊卡片包含文章標題、段落跳轉按鈕與 Google Maps 外部連結。
- 2026-03-14：優化地圖互動性。修正插針圖層阻擋底層地圖操作的問題，現在背景地圖已可自由拖曳與縮放；同步精簡插針預設樣式並強化資訊卡片細節。
- 2026-03-14：升級地圖至 Google Maps JS SDK。引入 `@googlemaps/js-api-loader` 並實作動態 Geocoding，確保插針能精確鎖定座標並隨地圖拖曳同步移動；恢復客製化插針與點擊資訊卡片設計。
