# AGENTS.md — chat-blog

## Project Configuration

## Project Overview

`chat-blog` 是一個將對話素材整理為可審稿、可發布文章的內容系統。

核心目標：
- 使用者透過對話提供素材（文字、圖片、補充說明）
- 系統先建立 Draft 到共編區
- 使用者在手機優先的 GUI 共編頁確認後才發布
- **Markdown（frontmatter + body）為基礎儲存格式（SoT）**

---

## Key Technologies

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS + SCSS Modules（Hybrid）
- **Content Storage**: Markdown files with frontmatter
- **Package Manager**: pnpm

> 套件管理規範：一律使用 `pnpm`，不要使用 `npm` / `yarn`。

---

## Core Product Rules

1. **MD as Source of Truth**
   - 底層資料以 `.md` 儲存（frontmatter + markdown body）
   - GUI 編輯後由系統寫回 MD

2. **Mobile-first Co-editing**
   - 共編頁以手機體驗優先
   - 單欄、專注內容，不採複雜多欄工作台

3. **Publish by Explicit Confirmation**
   - 發布流程：`draft` → `review` → `published`
   - 未確認不得公開發布

4. **Image Handling (v1)**
   - 不做自動圖片解析（省 token）
   - 提供 GUI 選圖與欄位編輯（cover image / alt / caption）

---

## Styling Strategy (Hybrid)

### Why Hybrid
- Tailwind：提高開發速度、快速建立工具頁與互動元件
- SCSS Modules：保留高可控樣式能力，適合外部 blog 視覺與長期客製化

### Usage Boundary
- **Tailwind first**：
  - 管理後台／共編工具頁的 layout、spacing、快速互動元件
- **SCSS Modules first**：
  - Blog 前台閱讀體驗
  - 品牌視覺、排版系統、可重用主題樣式
  - 複雜組件樣式與細節微調

### Guardrails
- 不將樣式完全鎖死在 utility class，避免日後重構成本過高
- 不使用大量 global CSS 汙染元件
- 若樣式會跨頁重用或需要品牌級一致性，優先抽成 SCSS module

---

## Architectural Principles

- **Separation of Concerns**
  - UI 編輯層：處理使用者輸入與預覽
  - Content Service 層：處理 frontmatter/body 正規化與存取
  - Publish 層：處理 metadata、JSON-LD、sitemap/routing 同步

- **Deterministic Transform**
  - 同一份 UI 欄位輸入，必須穩定轉換為同一結構的 MD

- **AI/SEO Readability by Default**
  - 發布內容應具有清楚 heading 層級、摘要、語意化結構
  - 結構化資料與頁面 metadata 在發布時同步維護

---

## Non-Goals (v1)

- 不做多人即時協作
- 不做自動圖片理解/標註
- 不做雙語內容自動生成
- 不先綁定重型外部 CMS/DB 作為主 SoT

---

## Workflow Contract

1. 對話輸入素材
2. 建立/更新 draft
3. 回傳可 review 的頁面連結
4. 使用者在共編頁確認設定與內容
5. 手動觸發發布

---

## Notes

- 本專案的實際環境初始化，需先對照 `Life-Hiker-Studio` 的熟悉架構再定案。
- 在定案前，不預先建立不必要的服務依賴。