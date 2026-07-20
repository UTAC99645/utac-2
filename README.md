# UTAC-2

基于 **Vue 3** + **TypeScript** + **Vite** 构建的个人主页与搜索聚合应用。

在线预览：[utac.top](https://utac.top)

## 功能特性

| 功能                 | 说明                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| **搜索引擎聚合**     | 支持 Google、Bing、DuckDuckGo 一键切换，配置从 JSON 动态加载             |
| **链接预览**         | 输入 URL 直接在页面内预览，无需跳转                                      |
| **万能文件查看器**   | 支持 Markdown、HTML、图片、PDF、视频、音频、代码高亮、JSON、纯文本等格式 |
| **QR 码生成器**      | 支持纠错等级调整、额外参数拼接、一键下载                                 |
| **一言（Hitokoto）** | 随机展示优美句子，1.5s 后自动替换页面标题                                |
| **深色主题 UI**      | 基于 Naive UI 的暗色界面，全局毛玻璃视觉效果                             |

## 技术栈

- [Vue 3](https://vuejs.org/) — Composition API
- [TypeScript](https://www.typescriptlang.org/) — 类型安全
- [Vite](https://vitejs.dev/) — 构建工具
- [Vue Router 5](https://router.vuejs.org/) — 路由管理
- [Naive UI](https://www.naiveui.com/) — 组件库
- [Axios](https://axios-http.com/) — HTTP 客户端
- [Marked](https://marked.js.org/) — Markdown 渲染
- [Highlight.js](https://highlightjs.org/) — 代码语法高亮

## 项目结构

```
utac-2/
├── public/
│   └── assets/
│       ├── img/                # 图片资源
│       └── json/               # 数据文件
├── src/
│   ├── addition/               # 搜索引擎配置
│   │   ├── searchWay.json      # 主要搜索引擎
│   │   ├── searchKey.json      # 扩展引擎
│   │   └── mach.ts             # 机器配置
│   ├── components/
│   │   ├── home.vue            # 首页
│   │   ├── about.vue           # 关于页
│   │   ├── Link.vue            # 文件预览器
│   │   └── 404.vue             # 404 页面
│   ├── css/
│   │   ├── main.css            # 全局样式 + CSS 变量
│   │   ├── home.css
│   │   ├── about.css
│   │   ├── link.css
│   │   ├── router.css
│   │   ├── 404.css
│   │   └── naive-ui-glass.css  # 毛玻璃主题
│   ├── ts/
│   │   └── type.ts             # TypeScript 类型定义
│   ├── main.ts                 # 应用入口
│   ├── main.vue                # 根组件
│   ├── axios.ts                # Axios 拦截器
│   └── main.css                # 全局 CSS
├── index.html
├── vite.config.ts
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── tsconfig.node.json
```

## 快速开始

**环境要求**：Node.js >= 20

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

| 路径      | 组件        | 描述                                                |
| --------- | ----------- | --------------------------------------------------- |
| `/:type?` | `home.vue`  | 首页 — 搜索、QR 码、一言。`type` 为可选搜索引擎参数 |
| `/about`  | `about.vue` | 关于页                                              |

## 文件预览支持格式

| 类型     | 扩展名                                        | 渲染方式              |
| -------- | --------------------------------------------- | --------------------- |
| Markdown | `.md`                                         | Marked 渲染           |
| HTML     | `.html`                                       | 直接渲染              |
| 图片     | `.jpg`, `.png`, `.gif`, `.webp`, `.svg`       | `<img>`               |
| PDF      | `.pdf`                                        | `<iframe>`            |
| 视频     | `.mp4`, `.webm`, `.mov`                       | `<video>`             |
| 音频     | `.mp3`, `.wav`, `.flac`                       | `<audio>`             |
| JSON     | `.json`                                       | 格式化高亮            |
| 代码     | `.js`, `.vue`, `.py`, `.rs`, `.go`, `.css`... | Highlight.js 语法高亮 |
| 纯文本   | `.txt`, `.log`, `.ini`                        | `<pre>`               |
| 网页     | `http(s)://`                                  | 沙盒 `<iframe>`       |

## 搜索引擎配置

引擎列表由 `src/addition/searchWay.json` 和 `searchKey.json` 动态加载：

```json
[
  ["duckduckgo", { "en": false, "url": "https://duckduckgo.com/?q=" }],
  ["google", { "en": true, "url": "https://www.google.com/search?q=" }]
]
```

- `en` — 是否激活
- `url` — 搜索前缀
- `on` — Link 模式是否进入预览

## 许可证

[MIT](LICENSE)

## 作者

**UTAC** — [UTAC99645](https://github.com/UTAC99645)
