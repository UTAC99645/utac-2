# UTAC-2 AGENTS.md

## Project Overview

基于 **Nuxt**（SSR）+ **Vue 3** + **TypeScript** + **Naive UI** 构建的个人主页与搜索聚合应用。支持多引擎搜索、万能文件查看器（链接预览）、QR 码生成、一言（Hitokoto）展示和真实访问统计，通过 URL query 参数分享搜索状态。公开地址：[utac.top](https://utac.top)，部署于 Cloudflare Pages（Git 集成，推送 `main` 自动部署）。

### 技术栈

- Nuxt（应用框架，`nuxt.config.ts` 中 `ssr: true`；nightly 版本，`@nuxt/cli-nightly` + `nuxt-nightly`）
- Vue 3（Composition API）
- TypeScript（`pnpm typecheck` = `nuxt typecheck`）
- Naive UI（`plugins/native-ui.ts` 全局注册，模板中直接使用 `n-*` 组件）
- Marked + Highlight.js（Markdown / 代码渲染，仅 FileViewer 异步加载）
- Nitro（`nitro` beta，Pages Functions 兼容；`functions/api/stats.js` 依赖此运行时）
- unplugin-auto-import / unplugin-vue-components
- pnpm@12.21.0（`packageManager` 字段钉死精确版本——Cloudflare CI 只认精确 semver，写 `latest` 会导致 build:failure）

### 构建与命令

- 开发：`pnpm dev`
- 构建：`pnpm build`（产物在 `.output/`；被 signal 打断会产生撕裂产物——public 有而 server 无，再启动会 `MODULE_NOT_FOUND`，必须完整重建）
- 预览：`pnpm preview`，或 `node .output/server/index.mjs`（端口 3000）
- 类型检查：`pnpm typecheck`
- 无 lint 脚本（eslint 未安装；如需静态检查需自行安装并配置）

### 部署架构

```
GitHub UTAC99645/utac-2 (main)
  └─> Cloudflare Pages 项目 utac-2（绑定 utac.top）
        ├─ Nuxt SSR：pnpm nuxt build → .output（含 server 端 SSR）
        ├─ Pages Function：functions/api/stats.js → /api/stats
        └─ 环境变量：CF_STATS_TOKEN（production + preview 都要配）
            改动 deployment_configs 后需新部署才生效（可用空提交触发）

静态资源站（另一个项目）：UTAC99645/file 仓库 → file.utac.top
  ├─ about.json（About 页成员数据源，含 Neko 的内嵌 SVG 头像）
  ├─ 字体历史 TTF（现已弃用，改为本仓库自托管子集）
  └─ 分支是 master 不是 main；仓库全是大图片，整库克隆会超时
     （用 --depth 1 --filter=blob:none --sparse + sparse-checkout 只拉需要的目录）
```

### 代码组织

```
utac-2/
├── app/
│   ├── app.vue                # 根组件（深色主题 / 悬浮玻璃导航 site-nav + 滚动加深 /
│   │                          #   首屏资源 preload 注入 / 指针轨迹特效挂载）
│   ├── error.vue              # 全局错误页（Nuxt 约定文件，深色毛玻璃卡片）
│   ├── pages/
│   │   ├── index.vue          # 首页（编排层：启动屏 + ClientOnly 包裹的搜索 UI /
│   │                          #   QR / 一言 / 链接预览入口；checkUrl() 处理 query 恢复）
│   │   ├── about.vue          # 关于页（远程 file.utac.top/.../about.json，失败显示"加载中..."）
│   │   ├── docs.vue           # 文档页（工作原理讲解）
│   │   ├── statistics.vue     # 统计页（引擎卡片由 useEngines 派生；访问数据读 /api/stats，
│   │                          #   失败回退演示数据并打"示例数据"标签）
│   │   └── [...slug].vue      # 兜底 404 页（背景为本仓库 WebP，粒子 + 毛玻璃卡片 + 故障字）
│   ├── components/
│   │   ├── FileViewer.vue     # 链接预览编排组件（异步加载，类型识别 + 分发渲染器）
│   │   ├── SearchQrPanel.vue  # QR 码面板（内部使用 useQrCode）
│   │   ├── HitokotoCard.vue   # 一言卡片（单条展示）
│   │   └── FileViewer/renderers/  # 渲染器子组件（显式导入，不参与自动导入）
│   ├── composables/
│   │   ├── useEngines.ts      # 引擎状态仓（单一数据源，运行时校验 JSON 配置）
│   │   ├── useYiyan.ts        # 一言（重试上限 3 次 + 冷却锁）
│   │   ├── useQrCode.ts       # QR 状态与 PNG 下载（document 操作都在回调里，SSR 安全）
│   │   ├── useHomePageData.ts # 首页数据编排
│   │   ├── type.ts            # 类型定义（EngineConfig / YiyanItem）
│   │   └── pointerTrail.ts    # 全站指针轨迹特效（仅在 app.vue onMounted 启动）
│   ├── utils/
│   │   ├── common.ts          # sleep 等通用工具
│   │   └── fileType.ts        # 文件类型识别纯函数（扩展名 + 内容嗅探 + MIME 映射）
│   ├── plugins/native-ui.ts   # Naive UI 注册插件
│   ├── addition/
│   │   ├── searchWay.json     # 主引擎列表（google / bing / duckduckgo / Link）
│   │   └── searchKey.json     # 扩展功能项（QR）
│   ├── assets/css/            # 页面样式（main / home / about / link / router / 404 /
│   │                          #   docs / statistics / naive-ui-glass）
│   └── public/assets/         # 静态资源（见下方"性能预算"）
├── functions/api/stats.js     # Pages Function：代理 Cloudflare GraphQL Analytics
├── docs/superpowers/          # 历史 plan / spec 文档（2026-08 视觉打磨、docs 页设计）
└── nuxt.config.ts             # Nuxt 配置（SSR、CSS、自动导入、组件目录）
```

## 开发约定

- **单一数据源**：引擎激活态 / 链接预览开关只存在于 `useEngines` 的 `useState` 中；
  JSON 里的 `en` / `on` 是历史兼容字段，读取时会被忽略，禁止再从 JSON 同步状态
- **引擎配置校验**：`useEngines.ts` 的 `loadEntries()` 在模块加载时校验 JSON
  （名称非空、`url` 为字符串），非法条目跳过并 `console.warn`，禁止用 `!` 非空断言访问配置
- **URL 设计**：搜索状态通过 query 参数同步 —— `/?type=<引擎>&q=<搜索词>&open=<true|false>`；
  `open=true` 打开即搜索，`type` 非法值回退 `duckduckgo`（校验逻辑在 `pages/index.vue` 的 `checkUrl()`）
- **新增引擎**：向 `app/addition/*.json` 追加 `[名称, { "url": "前缀" }]` 即可，
  下拉框 / 快捷按钮 / 统计页卡片 / URL 校验全部自动生效
- **组件分层**：页面只做编排；业务状态在 composables，类型识别等纯逻辑在 utils，
  渲染器子组件放 `components/<Parent>/renderers/` 并在父组件显式 import
  （子目录组件不参与 Nuxt 自动导入，模板里直接写标签名会解析失败）
- **自动导入**：`ref` / `computed` / `useRoute` 等由 Nuxt 内置；`useMessage` /
  `useDialog` / `useNotification` / `useLoadingBar` 由 `nuxt.config.ts` 的 `imports.presets` 注入；
  `composables/` 与 `utils/` 的命名导出全局自动导入
- **导入习惯**：页面内样式与数据以相对路径导入（`../assets/css/*.css`、`../addition/*.json`）；不使用 `@/` 别名
- **响应式断点**：全站统一断点约定见 `assets/css/main.css` 顶部（小屏手机 ≤480px、手机 ≤640px、
  平板 ≤1024px、桌面 ≥1025px、触屏 `(hover:none)`、减少动效 `prefers-reduced-motion`）；
  `assets/css/naive-ui-glass.css` 为主题覆盖，除非确有需要否则不改动

## SSR 约束（重要，违反会 500）

- **不要在 setup 顶层或渲染路径触碰 `document` / `window`**（naive-ui Select、vueuc Follower
  等组件内部会测量浏览器 DOM）。首页主内容用 `<ClientOnly>` 包裹，服务端只直出
  纯 CSS 启动屏（`boot-screen`）。历史教训：旧版首页 SSR 只渲染 1ms GIF 分支、
  主内容从不真正 SSR，掩盖了该问题；改为启动屏后立刻爆出 500
  `"document is not defined"`（被 `ssrFixStacktrace` 吞成
  `"Cannot assign to read only property 'stack'"`）
- **不要用 `nuxt.config.ts` 的 `app.head`**：本 Nuxt 5 nightly 下会 SSR 500
  `"Cannot read properties of undefined (reading 'head')"`。head 注入一律用
  `app.vue` 的 `useHead()`（参考 preload 写法）
- 排查 SSR 打包问题：在 `.output/server/_ssr/*.mjs` 里
  `rg '\(void 0\)\.head'`（打包后的 `document.head`）
- 引擎切换不再重播启动屏（旧版 `initLaod()` 会在 watch 里闪 GIF，已移除）

## 性能预算（首屏 ~2.3MB，别加回去）

| 资源 | 现状 | 禁止 |
| --- | --- | --- |
| 背景图 | `public/assets/img/143937772_p2.webp`（789KB，cwebp -q 82） | 引入 >300KB 的位图；404 页已改用本地 WebP，不要改回外链 |
| 字体 | `public/assets/font/MapleMono-sub.woff2`（1.5MB 子集：ASCII + GB2312 全汉字 + 假名 + 中文标点） | 改回外链整包 TTF（19.5MB） |
| 启动屏 | 纯 CSS（`home.css` 的 `.boot-screen`），750ms + 280ms 退场 | 加回图片/GIF 加载动画 |
| 预加载 | `app.vue` useHead：背景 WebP（`fetchpriority=high`）+ 字体 woff2 | — |

若需新增字符到字体子集：改字符清单后用 `pyftsubset` 重新生成
（源字体 file.utac.top/font/MapleMono-NF-CN-ExtraBold.ttf），并用 TTFont 校验无缺字。

## 测试策略

- 类型安全：`pnpm typecheck`
- 功能验证：`pnpm build` 通过后 `node .output/server/index.mjs` 启动预览，
  `curl` 检查 `/`、`/about`、`/docs`、`/statistics`、任意路径（404）均返回 200；
  静态资源抽查 `/assets/img/143937772_p2.webp`、`/assets/font/MapleMono-sub.woff2`
- 无自动化测试框架，改动后以上述命令人工验证
- **无头浏览器截图三大假象**（验收 UI 时必读）：
  1. 入场动画（fadeIn 等）抓在第一帧 = 元素"隐身"，先查 DOM 的 opacity 再下结论
  2. 整页截图会重启 CSS 动画，同样可能抓到第一帧
  3. 视口覆盖后 `100vw` 不跟随 → 报出 407px 之类的容器宽度是假象
  验证一律以 DOM 计算样式（getComputedStyle）为准

## 安全考虑

- 链接预览中 HTML 直接渲染（`v-html`）、PDF/网页用沙盒 iframe，内容来自用户输入的外部 URL
- Markdown 渲染使用 marked（无内置 sanitize），外部内容存在 XSS 风险，仅用于受信场景
- `CF_STATS_TOKEN` 只存 Pages 环境变量（只读 Zone Analytics 权限），永不出现在前端代码 /
  构建产物 / 响应体中；`/api/stats` 响应缓存 10 分钟
- about 数据来自远程静态服务（`file.utac.top`），网络异常时显示"加载中..."（列表已含常驻成员，
  不会白屏）

## 持续改进建议

- 为 `addition/*.json` 增加构建期 schema 校验（当前为运行时告警跳过）
- 增加自动化测试覆盖率（目前仅类型检查 + 构建验证）
- 字体可再按需拆分 unicode-range 分包（当前 1.5MB 单文件已可接受）
- Markdown 渲染加 sanitize 管线
