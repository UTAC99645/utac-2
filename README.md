# UTAC-2

基于 **Vue 3** + **TypeScript** + **Vite** 构建的个人主页与搜索聚合应用。

在线预览：[utac.top](https://utac.top)

## 功能特性

| 功能                 | 说明                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| **搜索引擎聚合**     | 引擎列表从 JSON 动态加载，下拉选择或按钮一键切换                         |
| **可分享的搜索链接** | 引擎与搜索词实时同步进 URL 路径，配合 `?open=true` 打开即搜索            |
| **链接预览**         | 输入 URL 直接在页面内预览，无需跳转                                      |
| **万能文件查看器**   | 支持 Markdown、HTML、图片、PDF、视频、音频、代码高亮、JSON、纯文本等格式 |
| **QR 码生成器**      | 支持纠错等级调整、额外引擎前缀 / Link 后缀拼接、一键下载 PNG             |
| **一言（Hitokoto）** | 随机展示优美句子，挂载 1.5s 后自动替换页面标题                           |
| **深色主题 UI**      | 基于 Naive UI 的暗色界面，全局毛玻璃视觉效果                             |

## 技术栈

- [Vue 3](https://vuejs.org/) — Composition API
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [Vite](https://vitejs.dev/) — 构建工具
- [Vue Router](https://router.vuejs.org/) — 路由管理
- [Naive UI](https://www.naiveui.com/) — 组件库（按需自动注册）
- [Axios](https://axios-http.com/) — HTTP 客户端（全局拦截器统计请求耗时）
- [Marked](https://marked.js.org/) — Markdown 渲染
- [Highlight.js](https://highlightjs.org/) — 代码语法高亮
- [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) — 自动注入 `ref`、`computed`、`useMessage` 等 API
- [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) — Naive UI 组件按需解析

## 项目结构

```
utac-2/
├── public/
│   └── assets/
│       ├── img/                # 图片资源
│       └── json/               # 数据文件
├── src/
│   ├── addition/               # 搜索引擎配置
│   │   ├── searchWay.json      # 主引擎列表（google / bing / duckduckgo / Link）
│   │   ├── searchKey.json      # 扩展功能项（QR）
│   │   └── mach.ts             # 合并 JSON，生成路由 type 参数的匹配正则
│   ├── components/
│   │   ├── home.vue            # 首页（搜索 / QR 码 / 一言 / 链接预览入口）
│   │   ├── about.vue           # 关于页（数据来自远程 about.json）
│   │   ├── Link.vue            # 链接预览 / 万能文件查看器
│   │   └── 404.vue             # 404 页面
│   ├── css/
│   │   ├── main.css            # 全局样式 + CSS 设计令牌（变量）
│   │   ├── home.css            # 首页样式
│   │   ├── about.css           # 关于页样式
│   │   ├── link.css            # 文件查看器样式
│   │   ├── router.css          # 面包屑导航样式
│   │   ├── 404.css             # 404 页样式
│   │   └── naive-ui-glass.css  # Naive UI 全局毛玻璃主题（单文件覆盖）
│   ├── ts/
│   │   └── type.ts             # TypeScript 类型定义
│   ├── main.ts                 # 应用入口（路由配置 + 挂载）
│   ├── main.vue                # 根组件（主题 / 面包屑 / 路由视图）
│   ├── axios.ts                # Axios 全局拦截器（统计请求耗时）
│   └── main.css                # 预留空文件
├── index.html                  # HTML 入口（挂载点 #main）
├── vite.config.ts              # Vite 配置（自动导入 / 别名 / 构建）
├── auto-imports.d.ts           # 自动生成：自动注入 API 的类型声明（勿手改）
├── components.d.ts             # 自动生成：Naive UI 组件类型声明（勿手改）
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── tsconfig.node.json
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

## 路由

| 路径                              | 组件        | 描述                                                     |
| --------------------------------- | ----------- | -------------------------------------------------------- |
| `/:type(引擎名)?/:query(搜索词)?` | `home.vue`  | 首页。`type` 仅允许已配置的引擎名；`query` 为可选搜索词  |
| `/about`                          | `about.vue` | 关于页                                                   |
| `/:pathMatch(.*)*`                | `404.vue`   | 兜底 404 页                                              |

首页会把当前引擎与输入实时同步到路径，因此 URL 可直接分享：

```
/google/hello            # 打开后引擎为 google，输入框填入 hello
/google/hello?open=true  # 打开后自动执行一次搜索
/Link/https://example.com/a.md?open=true  # 打开后直接进入链接预览
```

`open` 参数支持 `true` / `t` / `false` / `f`，其他值按真值处理；页面标题会随路由变为 `引擎-搜索词`。

## 搜索引擎配置

引擎列表由 `src/addition/searchWay.json`（主引擎）与 `src/addition/searchKey.json`（扩展功能项）动态加载，格式为 `[名称, 配置]` 二元组数组：

```json
[
  ["google", { "en": true, "url": "https://www.google.com/search?q=", "icon": "/assets/xicons/google.svg" }],
  ["duckduckgo", { "en": false, "url": "https://duckduckgo.com/?q=" }],
  ["Link", { "en": false, "on": false, "url": "https://utac99645.top/?q=" }]
]
```

- `en` — 是否为当前激活项（运行时同一时刻只有一个为 `true`）
- `url` — 搜索前缀，与关键词拼接后打开
- `on` — 仅 Link 引擎使用：是否进入内嵌预览
- `icon` — 图标路径（预留字段）

新增引擎只需向 JSON 追加条目，路由匹配、下拉选项、快捷按钮都会自动生成。

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
