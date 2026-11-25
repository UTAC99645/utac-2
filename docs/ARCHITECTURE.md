# 架构总览（ARCHITECTURE）

> 适用版本：2026-11（commit 88b1de2 之后）。历史设计文档见 `docs/superpowers/`。

## 一句话

Nuxt 5 nightly（SSR）+ Vue 3 + TS + Naive UI 的搜索聚合站；引擎配置即数据（JSON），
状态单源（useEngines useState），Cloudflare Pages 托管 SSR + Pages Function。

## 分层

```
┌──────────── 页面（编排层）────────────┐
│ index / about / docs / statistics / 404 │
│  · 只做布局编排与页面级 watch             │
└──────────────┬───────────────────────┘
               │ 调用
┌──────────────▼───────────────────────┐
│ composables（状态与业务）              │
│  useEngines  引擎单源（useState）      │
│  useYiyan    一言拉取（重试≤3+冷却锁） │
│  useQrCode   QR 拼接与下载            │
└──────────────┬───────────────────────┘
               │ 读取
┌──────────────▼───────────────────────┐
│ 数据与纯逻辑                           │
│  addition/*.json  引擎配置（可增删）   │
│  utils/fileType  类型识别（纯函数）    │
│  utils/common    sleep 等             │
└──────────────────────────────────────┘

渲染器支线：FileViewer.vue → renderers/{Markdown,Code,Json,Media,Web}
（子目录组件不参与自动导入，必须显式 import）
```

## 渲染链路（SSR 注意事项）

- `app.vue`：`n-config-provider(darkTheme)` → 悬浮玻璃导航 `site-nav`
  （品牌字 + 面包屑，滚动 >90px 挂 `is-scrolled` 加深）→ `NuxtPage`
- **首页是唯一需要 ClientOnly 的页面**：搜索 UI（n-select / vueuc Follower）
  在 SSR 摸浏览器 DOM 会 500；服务端只直出纯 CSS 启动屏 `boot-screen`，
  客户端挂载后才渲染 `home-page`
- head 注入（preload / SEO）全部走 `app.vue` 的 `useHead()` / `useSeoMeta()`；
  **禁止** `nuxt.config.ts` 的 `app.head`（本 nightly 会 SSR 500）

## 数据流

```
searchWay.json + searchKey.json
        │ 模块加载时 loadEntries() 运行时校验
        ▼
useEngines（useState 单源：active / previewOn）
        │ 派生
   ┌────┴─────────┬──────────────┬───────────────┐
 首页下拉/按钮   统计页引擎卡片   URL query 同步    Link/QR 模式切换
（shortcutKeys）（engineCards） （checkUrl/watch）（isQrMode/isLinkMode）
```

- URL 状态：`/?type=<引擎>&q=<词>&open=<bool>`；`open=true` 打开即搜索；
  非法 `type` 回退 `duckduckgo`；输入变化实时 `router.replace` 可分享
- 一言：`v1.hitokoto.cn`，挂载拉取 + 1.5s 后替换页面标题，刷新有 2s 冷却
- 统计：`statistics.vue` → `/api/stats`（Pages Function 代理 CF GraphQL Analytics）
  → 失败回退内置演示数据 + "示例数据"标签

## 样式体系

- 设计令牌在 `main.css` `:root`（品牌色 / 玻璃 / 断点 / 动效曲线），
  全站标题渐变 `--grad-brand`、光晕 `--glow-primary`
- `naive-ui-glass.css`：naive-ui 全组件毛玻璃主题（2374 行，非必要不动）
- 页面样式按页拆文件（home/about/docs/statistics/link/404），由页面 import
- 全局 h1 渐变字 + 光晕衬底 + 底部光条；404/错误页 `.glitch` 故障字已排除
- 极光氛围层：`body::after` 三团径向光晕 26s 漂移（`prefers-reduced-motion` 关闭）

## 构建产物

`pnpm build` → `.output/`（Nitro，SSR server + public）。启动：`node .output/server/index.mjs`。
注意：构建被 signal 打断会产出撕裂 `.output`（public 有 server 无），
server 起不来 `MODULE_NOT_FOUND` 时删掉 `.output` 完整重建。
