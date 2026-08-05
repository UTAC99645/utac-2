# UTAC-2 AGENTS.md

## Project Overview

基于 **Nuxt 4**（`ssr: false`，纯 SPA 模式）+ **Vue 3** + **TypeScript** + **Naive UI** 构建的个人主页与搜索聚合应用。支持多引擎搜索、万能文件查看器（链接预览）、QR 码生成和一言（Hitokoto）展示，通过 URL query 参数分享搜索状态。公开预览地址：[utac.top](https://utac.top)。

### 技术栈

- Nuxt 4（应用框架，`nuxt.config.ts` 中 `ssr: false`）
- Vue 3（Composition API）
- TypeScript
- Naive UI（`plugins/native-ui.ts` 全局注册，模板中直接使用 `n-*` 组件）
- Axios（`composables/axios.ts` 拦截器，暂未启用）
- Marked + Highlight.js（Markdown / 代码渲染，仅 Link 预览异步加载）
- unplugin-auto-import / unplugin-vue-components

### 构建与命令

- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`
- 类型检查：`pnpm exec vue-tsc --noEmit`
- 代码检查：`pnpm lint`（注意：脚本已定义，但 **eslint 未安装，当前不可用**，使用前需先安装配置）

### 代码组织

```
utac-2/
├── app.vue                    # 根组件（深色主题 / 面包屑导航 / 路由视图）
├── nuxt.config.ts             # Nuxt 配置（SPA、CSS、自动导入、别名、组件目录）
├── pages/
│   ├── index.vue              # 首页（搜索 / QR 码 / 一言 / 链接预览入口）
│   ├── about.vue              # 关于页（远程 about.json）
│   └── [...slug].vue          # 兜底 404 页（route.params.slug 为错误路径）
├── components/
│   └── Link.vue               # 链接预览 / 万能文件查看器
├── composables/
│   ├── auto.mach.ts            # Nuxt 模块：将 mach.ts 的 searchEngineTypes 注入为全局自动导入
│   ├── mach.ts                 # 引擎名正则片段（computed ref，消费方取 .value）
│   ├── axios.ts               # Axios 拦截器（纯副作用模块，未被引用）
│   └── type.ts                # 类型定义（EngineConfig / YiyanItem）
├── plugins/
│   └── native-ui.ts           # Naive UI 注册插件
├── addition/
│   ├── searchWay.json         # 主引擎列表（google / bing / duckduckgo / Link）
│   └── searchKey.json         # 扩展功能项（QR）
├── assets/css/                # 页面样式（main / home / about / link / router / 404 / naive-ui-glass）
└── public/assets/img/         # 图片资源（加载动效、404 背景）
```

### 开发约定

- **URL 设计**：搜索状态通过 query 参数同步 —— `/?type=<引擎>&q=<搜索词>&open=<true|false>`；`open=true` 打开即搜索，`type` 非法值回退 `duckduckgo`（校验逻辑在 `pages/index.vue` 的 `checkUrl()`，正则来自 `composables/mach.ts`）
- **引擎配置**：`addition/*.json` 为 `[名称, 配置]` 二元组数组；`en` 激活态、`url` 搜索前缀、`on`（仅 Link）进入预览、`icon` 预留未使用；新增引擎只需追加 JSON 条目
- **自动导入**：`ref` / `computed` / `useRoute` 等由 Nuxt 内置；`useMessage` / `useDialog` / `useNotification` / `useLoadingBar` / `axios` 由 `nuxt.config.ts` 的 `imports.presets` 注入，无需手动 import
- **组件注册**：`components/` 目录 `pathPrefix: false`，`Link.vue` 在 index.vue 中以 `<Rader>` 异步组件引用（`defineAsyncComponent`，避免首屏加载 marked / highlight.js）
- **导入习惯**：页面内样式与数据以相对路径导入（`../assets/css/*.css`、`../addition/*.json`）；勿使用 `@/` 别名（nuxt.config.ts 中 `@` 指向已删除的 `./src`，属死配置）

### 测试策略

- 类型安全：`pnpm exec vue-tsc --noEmit`
- 功能验证：`pnpm build` 通过后 `node .output/server/index.mjs` 启动预览，`curl` 检查 `/`、`/about`、任意路径（404）均返回 200
- 无自动化测试框架，改动后以上述命令人工验证

### 安全考虑

- 链接预览中 HTML 直接渲染（`v-html`）、PDF/网页用沙盒 iframe，内容来自用户输入的外部 URL
- 404 背景图、about 数据来自远程静态服务（`file.utac99645.top` / `file.utac.top`），网络异常时页面应优雅降级

## 持续改进建议

- 安装并配置 eslint，恢复 `pnpm lint` 脚本
- 为引擎配置 JSON 增加运行时校验（当前依赖 `!` 非空断言访问 `fullMap.get(...)`)
- 增加自动化测试覆盖率（目前仅类型检查 + 构建验证）
