# UTAC-2 AGENTS.md

## Project Overview

基于 **Nuxt**（SSR）+ **Vue 3** + **TypeScript** + **Naive UI** 构建的个人主页与搜索聚合应用。支持多引擎搜索、万能文件查看器（链接预览）、QR 码生成和一言（Hitokoto）展示，通过 URL query 参数分享搜索状态。公开预览地址：[utac.top](https://utac.top)。

### 技术栈

- Nuxt（应用框架，`nuxt.config.ts` 中 `ssr: true`）
- Vue 3（Composition API）
- TypeScript
- Naive UI（`plugins/native-ui.ts` 全局注册，模板中直接使用 `n-*` 组件）
- Marked + Highlight.js（Markdown / 代码渲染，仅 FileViewer 异步加载）
- unplugin-auto-import / unplugin-vue-components

### 构建与命令

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`
- 类型检查：`pnpm exec vue-tsc --noEmit`
- 无 lint 脚本（eslint 未安装；如需静态检查需自行安装并配置）

### 代码组织

```
utac-2/
├── app/
│   ├── app.vue                # 根组件（深色主题 / 面包屑导航 / 路由视图）
│   ├── error.vue              # 全局错误页（Nuxt 约定文件，深色毛玻璃卡片）
│   ├── pages/
│   │   ├── index.vue          # 首页（编排层：搜索 / QR / 一言 / 链接预览入口）
│   │   ├── about.vue          # 关于页（远程 about.json）
│   │   ├── docs.vue           # 文档页（工作原理讲解）
│   │   ├── statistics.vue     # 统计页（引擎卡片由 useEngines 派生，与首页同源）
│   │   └── [...slug].vue      # 兜底 404 页（route.params.slug 为错误路径）
│   ├── components/
│   │   ├── FileViewer.vue     # 链接预览编排组件（异步加载，类型识别 + 分发渲染器）
│   │   ├── SearchQrPanel.vue  # QR 码面板（内部使用 useQrCode）
│   │   ├── HitokotoCard.vue   # 一言卡片（单条展示）
│   │   └── FileViewer/renderers/  # 渲染器子组件（显式导入，不参与自动导入）
│   ├── composables/
│   │   ├── useEngines.ts      # 引擎状态仓（单一数据源，运行时校验 JSON 配置）
│   │   ├── useYiyan.ts        # 一言（重试上限 3 次 + 冷却锁）
│   │   ├── useQrCode.ts       # QR 状态与 PNG 下载
│   │   ├── useHomePageData.ts # 首页数据编排
│   │   ├── type.ts            # 类型定义（EngineConfig / YiyanItem）
│   │   └── pointerTrail.ts    # 全站指针轨迹特效
│   ├── utils/
│   │   ├── common.ts          # sleep 等通用工具
│   │   └── fileType.ts        # 文件类型识别纯函数（扩展名 + 内容嗅探 + MIME 映射）
│   ├── plugins/native-ui.ts   # Naive UI 注册插件
│   ├── addition/
│   │   ├── searchWay.json     # 主引擎列表（google / bing / duckduckgo / Link）
│   │   └── searchKey.json     # 扩展功能项（QR）
│   ├── assets/css/            # 页面样式（main / home / about / link / router / 404 / docs / naive-ui-glass）
│   └── public/assets/img/     # 图片资源（加载动效、404 背景）
└── nuxt.config.ts             # Nuxt 配置（SSR、CSS、自动导入、组件目录）
```

### 开发约定

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
- **响应式断点**：全站统一断点约定见 `assets/css/main.css` 顶部（手机 ≤640px、平板 ≤1024px、桌面 ≥1025px、触屏 `(hover:none)`、减少动效）；`assets/css/naive-ui-glass.css` 为主题覆盖，除非确有需要否则不改动

### 测试策略

- 类型安全：`pnpm exec vue-tsc --noEmit`
- 功能验证：`pnpm build` 通过后 `node .output/server/index.mjs` 启动预览，`curl` 检查 `/`、`/about`、`/docs`、`/statistics`、任意路径（404）均返回 200
- 无自动化测试框架，改动后以上述命令人工验证

### 安全考虑

- 链接预览中 HTML 直接渲染（`v-html`）、PDF/网页用沙盒 iframe，内容来自用户输入的外部 URL
- Markdown 渲染使用 marked（v5+ 无内置 sanitize），外部内容存在 XSS 风险，仅用于受信场景
- 404 背景图、about 数据来自远程静态服务（`file.utac99645.top` / `file.utac.top`），网络异常时页面应优雅降级

## 持续改进建议

- 为 `addition/*.json` 增加构建期 schema 校验（当前为运行时告警跳过）
- 增加自动化测试覆盖率（目前仅类型检查 + 构建验证）
- 页面访问统计（statistics 页）目前为演示数据，可接入真实统计后端
