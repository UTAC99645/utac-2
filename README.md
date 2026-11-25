# UTAC-2

基于 **Nuxt**（SSR）+ **Vue 3** + **TypeScript** + **Naive UI** 构建的个人主页与搜索聚合应用。

在线预览：[utac.top](https://utac.top)

## 功能特性

| 功能                 | 说明                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| **搜索引擎聚合**     | 引擎列表从 JSON 动态加载，下拉选择或按钮一键切换                         |
| **可分享的搜索链接** | 引擎与搜索词实时同步进 URL query，配合 `?open=true` 打开即搜索           |
| **链接预览**         | 输入 URL 直接在页面内预览，无需跳转                                      |
| **万能文件查看器**   | 支持 Markdown、HTML、图片、PDF、视频、音频、代码高亮、JSON、纯文本等格式 |
| **QR 码生成器**      | 支持纠错等级调整、额外引擎前缀 / Link 后缀拼接、一键下载 PNG             |
| **一言（Hitokoto）** | 随机展示优美句子，挂载 1.5s 后自动替换页面标题                           |
| **深色主题 UI**      | 基于 Naive UI 的暗色界面，全局毛玻璃视觉效果                             |

## 技术栈

- [Nuxt](https://nuxt.com/) — 应用框架
- [Vue 3](https://vuejs.org/) — Composition API
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [Naive UI](https://www.naiveui.com/) — 组件库（`plugins/native-ui.ts` 全局注册）
- [Marked](https://marked.js.org/) — Markdown 渲染
- [Highlight.js](https://highlightjs.org/) — 代码语法高亮
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) — 自动注入 `ref`、`computed`、`useMessage` 等 API
- [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) — Naive UI 组件按需解析

## 项目结构

```
utac-2/
├── app/
│   ├── app.vue                # 根组件（深色主题 / 悬浮玻璃导航 / 滚动加深 / 资源预加载）
│   ├── error.vue              # 全局错误页（深色毛玻璃卡片风格）
│   ├── pages/
│   │   ├── index.vue          # 首页（编排层：纯 CSS 启动屏 + ClientOnly 搜索 UI / QR / 一言 / 链接预览入口）
│   │   ├── about.vue          # 关于页（数据来自远程 about.json）
│   │   ├── docs.vue           # 文档页（工作原理讲解）
│   │   ├── statistics.vue     # 统计页（引擎概览来自 useEngines；访问数据来自 /api/stats 真实统计，失败回退演示数据）
│   │   └── [...slug].vue      # 兜底 404 页
│   ├── components/
│   │   ├── FileViewer.vue     # 链接预览 / 万能文件查看器（编排组件，异步加载）
│   │   ├── SearchQrPanel.vue  # QR 码面板（纠错等级 / 前缀后缀开关 / 下载）
│   │   ├── HitokotoCard.vue   # 一言卡片（单条展示 + 刷新）
│   │   └── FileViewer/renderers/  # 各文件类型渲染器
│   │       ├── MarkdownRenderer.vue  # Marked 渲染
│   │       ├── CodeRenderer.vue      # Highlight.js 高亮 + 复制
│   │       ├── JsonRenderer.vue      # 展开 / 折叠 + 复制
│   │       ├── MediaRenderer.vue     # 图片 / PDF / 视频 / 音频
│   │       └── WebRenderer.vue       # 沙盒 iframe 网页
│   ├── composables/
│   │   ├── useEngines.ts      # 引擎状态仓（单一数据源：配置解析 + 校验 + 激活态）
│   │   ├── useYiyan.ts        # 一言拉取（失败重试上限 3 次 + 冷却锁）
│   │   ├── useQrCode.ts       # QR 内容拼接 / 纠错等级 / PNG 下载
│   │   ├── useHomePageData.ts # 首页数据编排
│   │   ├── type.ts            # TypeScript 类型定义（EngineConfig / YiyanItem）
│   │   └── pointerTrail.ts    # 全站指针轨迹特效
│   ├── utils/
│   │   ├── common.ts          # 通用小工具（sleep 等）
│   │   └── fileType.ts        # 文件类型识别（纯函数：扩展名 + 内容嗅探）
│   ├── plugins/
│   │   └── native-ui.ts       # Naive UI 全局注册插件
│   ├── addition/
│   │   ├── searchWay.json     # 主引擎列表（google / bing / duckduckgo / Link）
│   │   └── searchKey.json     # 扩展功能项（QR）
│   ├── assets/css/            # 全局样式（main / home / about / link / router / 404 / docs / statistics / naive-ui-glass）
│   └── public/assets/         # 静态资源（WebP 背景、字体子集、404 背景等）
├── functions/api/stats.js     # Pages Function：/api/stats（代理 Cloudflare Analytics 真实访问统计）
├── docs/                      # 项目文档（ARCHITECTURE / DEPLOYMENT / PERFORMANCE / TROUBLESHOOTING）
├── nuxt.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json              # 继承 .nuxt/tsconfig.json
```

## 快速开始

**环境要求**：Node.js >= 20，包管理器 pnpm

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 路由与 URL 参数

| 路径             | 页面文件         | 描述                     |
| ---------------- | ---------------- | ------------------------ |
| `/`              | `index.vue`      | 首页                     |
| `/about`         | `about.vue`      | 关于页                   |
| `/docs`          | `docs.vue`       | 工作原理文档             |
| `/statistics`    | `statistics.vue` | 统计概览                 |
| 其他任意路径     | `[...slug].vue`  | 兜底 404 页              |

首页会把当前引擎与输入实时同步到 URL query，因此链接可直接分享：

```
/?type=google&q=hello             # 打开后引擎为 google，输入框填入 hello
/?type=google&q=hello&open=true   # 打开后自动执行一次搜索
/?type=Link&q=https://example.com/a.md&open=true  # 打开后直接进入链接预览
```

- `type` — 引擎名（仅允许 `searchWay.json` / `searchKey.json` 中已配置的项，非法值回退 `duckduckgo`）
- `q` — 搜索词
- `open` — 是否自动搜索（支持 `true` / `t` / `false` / `f`，其他值按真值处理）

## 搜索引擎配置

引擎列表由 `app/addition/searchWay.json`（主引擎）与 `app/addition/searchKey.json`（扩展功能项）动态加载，格式为 `[名称, 配置]` 二元组数组：

```json
[
  ["google", { "en": true, "url": "https://www.google.com/search?q=", "icon": "/assets/xicons/google.svg" }],
  ["duckduckgo", { "en": false, "url": "https://duckduckgo.com/?q=" }],
  ["Link", { "en": false, "on": false, "url": "https://utac99645.top/?q=" }]
]
```

- `url` — 搜索前缀，与关键词拼接后打开（**必填**，缺失的条目会在启动时被校验跳过并告警）
- `en` — 历史兼容字段，激活态现由 `useEngines` 状态仓统一管理，JSON 中的值会被忽略
- `on` — 历史兼容字段，链接预览开关现由 `useEngines` 的 `previewOn` 管理
- `icon` — 图标路径（预留字段，当前未使用）

新增引擎只需向 JSON 追加条目，下拉选项、快捷按钮、统计页卡片、URL 校验都会自动生效。

## 性能

首屏载荷约 **2.3MB**（背景 WebP 789KB + 自托管字体子集 1.5MB + 代码），启动屏为纯 CSS 零下载。资源红线与优化手法详见 [docs/PERFORMANCE.md](docs/PERFORMANCE.md)。

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | AI/协作者开发须知：约定、SSR 约束、性能预算、测试策略 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架构总览：分层、渲染链路、数据流、样式体系 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 部署指南：Cloudflare Pages 配置、/api/stats、发布与回滚流程 |
| [docs/PERFORMANCE.md](docs/PERFORMANCE.md) | 性能手册：预算、优化手法档案、验证方法 |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | 坑位速查：构建/SSR/样式/接口常见问题处方 |
| [docs/superpowers/](docs/superpowers/) | 历史设计与实施计划存档 |

## 文件预览支持格式

链接预览（Link 模式）按 URL 后缀识别类型，识别失败时会嗅探内容（JSON / HTML）：

| 类型     | 扩展名                                                                                          | 渲染方式                 |
| -------- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| Markdown | `.md`, `.markdown`                                                                              | Marked 渲染              |
| HTML     | `.html`, `.htm`, `.xhtml`                                                                       | 直接渲染                 |
| 图片     | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp`, `.ico`                                | `<img>`                  |
| PDF      | `.pdf`                                                                                          | 沙盒 `<iframe>`          |
| 视频     | `.mp4`, `.webm`, `.ogg`, `.mov`                                                                 | `<video>`                |
| 音频     | `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`                                                         | `<audio>`                |
| JSON     | `.json`                                                                                         | 格式化展示，可展开/折叠  |
| 代码     | `.js`, `.ts`, `.jsx`, `.tsx`, `.vue`, `.py`, `.rb`, `.go`, `.rs`, `.java`, `.c`, `.cpp`, `.css` 等 | Highlight.js 语法高亮    |
| 纯文本   | `.txt`, `.log`, `.cfg`, `.ini`, `.conf`                                                         | `<pre>`                  |
| 网页     | 无扩展名的 `http(s)` 地址，或带 `?format=web` 参数                                              | 沙盒 `<iframe>`          |

## 许可证

[MIT](LICENSE)

## 作者

**UTAC** — [UTAC99645](https://github.com/UTAC99645)

看板猫娘 **Neko** — [About 页](https://utac.top/about/) 第三位成员 喵~ 🐾
