# Doc 页面 + 文档化注释 设计

日期：2026-08-06
状态：已获用户批准

## 目标

1. 新增 `/docs` 文档页：图文长页，讲清整站「原理」，小白可看懂。
2. 为全部核心文件补齐 JSDoc 中文注释（纯注释，零逻辑变更）。

## 背景

- 项目：Nuxt 4（`ssr:false` 纯 SPA）+ Vue 3 + TS + Naive UI。
- 数据源：`addition/searchWay.json`（主引擎）、`addition/searchKey.json`（扩展项）。
- 状态同步：`/?type=<引擎>&q=<搜索词>&open=<true|false>` 双向同步。
- 现有注释已较丰富，需补齐的函数级 JSDoc。

## 设计

### A. 新增 `pages/docs.vue` + `assets/css/docs.css`

图文长页，`n-card` 分区块 + 等宽 `pre` 做图解。区块顺序：

1. 标题 + 一句话简介
2. 整站原理图（数据源 JSON → 内存 Map → 界面 数据流）
3. 核心搜索流程（选引擎 → 输入 → 提交 → 拼接 URL → 打开）
4. URL 分享原理（`/?type=&q=&open=` 拆解 + 双向同步）
5. 引擎配置原理（`[名称, 配置]` 结构 + `en`/`url`/`on` 字段）
6. QR 码生成（额外前缀 + 主体 + Link 后缀 三段拼接）
7. 链接预览 Link（按扩展名/内容嗅探识别类型）
8. 一言（请求 + 失败递归重试）
9. 配置教程（新增引擎 / 改默认引擎 / 调 QR 纠错）
10. 安全与注意事项（v-html XSS、沙盒 iframe、远程资源降级）

### B. 接线

`app.vue` 面包屑 `way` 数组追加 `{ name: "Docs", path: "/docs" }`。

### C. 补齐 JSDoc（不改逻辑）

- `pages/index.vue`：`searchfin`/`makeUrl`/`checkUrl`/`initLaod`/`yiyan`/`QRdownload` 等
- `components/Link.vue`：`loadFile`/`copyCode`/`isJsonContent`/`isHtmlContent`/`formatFileSize` 及部分 computed
- `pages/about.vue`、`composables/mach.ts`、`composables/type.ts`、`composables/auto.mach.ts`

## 验证

- `pnpm exec vue-tsc --noEmit` 通过
- `pnpm build` 成功，启动 `.output/server/index.mjs`，`curl /docs` 返回 200
