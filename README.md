# UTAC-2

一个基于 **Vue 3** + **Vite** 构建的现代化个人主页与搜索聚合应用。

在线预览：[utac99645.top](https://utac99645.top)

---

## ✨ 功能特性

- **🔍 多搜索引擎聚合** — 支持 Google、Bing、DuckDuckGo 一键切换，引擎配置从 JSON 动态加载，易于扩展
- **🔗 智能链接预览** — 输入 URL 可直接在页面内预览，无需跳转
- **📎 万能文件查看器** — 支持 Markdown、HTML、图片、PDF、视频、音频、代码高亮、JSON、纯文本等 10+ 种格式，毛玻璃 UI 与首页主题统一
- **📱 QR 码生成器** — 支持纠错等级调整（L/M/Q/H）、额外参数拼接、一键下载 PNG
- **💬 一言（Hitokoto）** — 随机展示来自 hitokoto.cn 的优美句子，1.5s 后自动替换页面标题
- **🎨 深色主题 UI** — 基于 Naive UI 的精致暗色界面，毛玻璃视觉效果
- **⚡ 快速加载** — Vite 驱动，文件查看器异步懒加载，首页 chunk 仅 ~280 KB

---

## 🛠 技术栈

| 技术 | 用途 |
|------|------|
| [Vue 3](https://vuejs.org/) | 渐进式前端框架，Composition API |
| [Vite](https://vitejs.dev/) | 下一代前端构建工具 |
| [Vue Router 5](https://router.vuejs.org/) | 单页应用路由管理 |
| [Naive UI](https://www.naiveui.com/) | Vue 3 组件库 |
| [Axios](https://axios-http.com/) | HTTP 客户端（含请求耗时统计拦截器）|
| [Marked](https://marked.js.org/) | Markdown 渲染引擎 |
| [Highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [Yarn](https://yarnpkg.com/) | 包管理器 |

---

## 📁 项目结构

```
utac-2/
├── public/                      # 静态资源
│   ├── assets/
│   │   ├── img/                # 图片资源（背景图、加载动画）
│   │   ├── json/               # 数据文件（about.json 等）
│   │   └── md/                 # Markdown 文档
│   ├── 404.html                # 404 错误页
│   └── 500.html                # 500 错误页
├── src/
│   ├── addition/               # 搜索引擎 JSON 配置
│   │   ├── searchWay.json      # 主要搜索引擎（Google / Bing / DuckDuckGo 等）
│   │   └── searchKey.json      # 扩展引擎（QR / Link / rlyiyan 等）
│   ├── components/             # Vue 组件
│   │   ├── home.vue            # 首页：搜索框、引擎切换、QR码、一言
│   │   ├── about.vue           # 关于页：人员信息展示
│   │   ├── Link.vue            # 文件预览器（LinkViewer）：10+ 格式渲染，毛玻璃主题，内置返回
│   │   └── 404.vue             # 404 页面：毛玻璃卡片 + 故障艺术字
│   ├── css/
│   │   ├── main.css            # 全局样式 + CSS 设计令牌（:root 变量）
│   │   ├── router.css          # 面包屑导航样式
│   │   ├── home.css            # 首页样式
│   │   └── about.css           # 关于页样式
│   ├── main.js                 # 应用入口：路由注册、动态参数构建、挂载
│   ├── main.vue                # 根组件：主题、面包屑、路由视图
│   └── axios.js                # Axios 拦截器：自动计算请求延迟
├── index.html                  # HTML 入口
├── vite.config.js              # Vite 配置（别名、自动导入）
├── package.json                # 项目依赖
└── yarn.lock                   # 依赖锁定
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Yarn >= 4.0.0

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 预览生产构建

```bash
yarn preview
```

---

## 🌐 路由说明

| 路径 | 组件 | 描述 |
|------|------|------|
| `/:type?` | `home.vue` | 首页 — 搜索聚合、QR码生成、一言展示。`type` 为可选的搜索引擎参数，动态匹配 JSON 配置中的引擎名称 |
| `/about` | `about.vue` | 关于 — 读取 `about.json` 展示人员信息 |

> 搜索关键词和引擎类型会自动同步到 URL Query，便于分享和回溯。

---

## 📎 文件预览支持格式

`Link.vue`（LinkViewer）组件内置了智能文件类型检测，采用与首页统一的毛玻璃暗色主题，支持以下格式：

| 类型 | 扩展名 / 特征 | 处理方式 |
|------|--------------|---------|
| Markdown | `.md`, `.markdown` | Marked 渲染 |
| HTML | `.html`, `.htm` | 直接渲染（含安全限制）|
| 图片 | `.jpg`, `.png`, `.gif`, `.webp`, `.svg`... | `<img>` 标签预览 |
| PDF | `.pdf` | `<iframe>` 嵌入 |
| 视频 | `.mp4`, `.webm`, `.mov`... | `<video>` 播放 |
| 音频 | `.mp3`, `.wav`, `.flac`... | `<audio>` 播放 |
| JSON | `.json` | 格式化高亮，支持展开/折叠 |
| 代码文件 | `.js`, `.vue`, `.py`, `.rs`, `.go`, `.css`... | Highlight.js 语法高亮，支持一键复制 |
| 纯文本 | `.txt`, `.log`, `.ini`... | `<pre>` 原样展示 |
| 网页 | `http://` / `https://` 无后缀 | 沙盒 `<iframe>` 浏览 |

---

## ⚙️ 配置说明

### 搜索引擎扩展

引擎列表由 `src/addition/searchWay.json` 和 `src/addition/searchKey.json` 动态加载：

- `searchWay.json`：主要搜索引擎（Google、Bing、DuckDuckGo）
- `searchKey.json`：扩展功能引擎（QR、Link、rlyiyan）

格式示例：

```json
[
  ["duckduckgo", { "en": false, "url": "https://duckduckgo.com/?q=" }],
  ["google",     { "en": true,  "url": "https://www.google.com/search?q=" }]
]
```

- `en`: 是否激活（boolean）
- `url`: 搜索前缀
- `on`: Link 模式专用，是否进入预览（boolean | null）

新增引擎只需在 JSON 中添加条目，路由会自动生成对应的动态匹配规则。

### CSS 设计令牌

全局样式基于 `src/css/main.css` 中的 `:root` CSS 变量构建，统一控制颜色、字体、间距、圆角、阴影与动效：

```css
:root {
  --color-primary: #CA4346;      /* 品牌红 */
  --color-success: #10b981;      /* 成功绿 */
  --color-info:    #6366f1;      /* 信息蓝 */
  --text-primary:   #ffffff;     /* 主文字 */
  --text-secondary: #eeeeee;     /* 次要文字 */
  --font-body:      MapleMono, -apple-system, ...;
  --space-lg:       18px;
  --radius-lg:      12px;
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.10);
}
```

各页面样式均引用上述变量，便于一键换色与主题维护。

### 组件交互

**Link.vue（文件预览器）**

- 通过 `props.url` 接收目标地址，自动检测文件类型并渲染
- 内置 **Back** 返回按钮，点击后触发 `@back` 事件通知父组件退出预览
- 使用 `defineAsyncComponent` 异步懒加载，避免打包大型依赖（Marked、Highlight.js）到首页 chunk

### Vite 路径别名

```js
// vite.config.js
alias: {
  '@': 'src/',
  '#': 'public/',
  '$': 'src/components/'
}
```

### 自动导入

项目配置了 `unplugin-auto-import` 和 `unplugin-vue-components`：

- Vue / Vue Router API（`ref`, `computed`, `watch`, `useRoute`...）无需手动 import
- Naive UI 组件自动按需引入
- Axios 自动注入为全局可用

---

## 🖼 关键依赖版本

| 依赖 | 版本 |
|------|------|
| Vue | ^3.5.32 |
| Vite | ^8.0.8 |
| Vue Router | ^5.0.4 |
| Naive UI | ^2.44.1 |
| Axios | ^1.15.0 |
| Marked | ^18.0.2 |
| Highlight.js | ^11.11.1 |

---

## 🌟 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

---

## 📜 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

---

## 👤 作者

**UTAC** — [UTAC99645](https://github.com/UTAC99645)
