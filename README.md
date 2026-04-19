# UTAC-2

一个基于 Vue 3 + Vite 构建的现代化前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Naive UI** - 优雅的 Vue 3 组件库
- **Axios** - HTTP 客户端
- **Marked** - Markdown 解析器
- **Highlight.js** - 代码语法高亮
- **Yarn** - 包管理器

## 项目结构

```
utac-2/
├── public/              # 静态资源
├── src/
│   ├── components/      # 组件目录
│   │   ├── home.vue    # 首页组件
│   │   ├── about.vue   # 关于页面组件
│   │   ├── Link.vue    # 链接组件
│   │   ├── home.css    # 首页样式
│   │   └── about.css   # 关于页面样式
│   ├── main.js         # 应用入口
│   ├── main.vue        # 根组件
│   ├── main.css        # 全局样式
│   ├── router.css      # 路由样式
│   └── axios.js        # Axios 配置
├── index.html          # HTML 入口
├── vite.config.js      # Vite 配置
├── package.json        # 项目依赖
└── yarn.lock           # Yarn 锁定文件
```

## 功能特性

- 基于 Vue 3 Composition API 开发
- 使用 Vite 实现快速冷启动和热更新
- 集成 Naive UI 提供美观的界面组件
- 支持 Markdown 渲染和代码高亮
- 使用 Vue Router 实现单页应用路由
- 通过 Axios 处理 HTTP 请求
- 自动导入组件和 API（unplugin-auto-import）

## 安装与运行

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

## 路由说明

| 路径 | 组件 | 描述 |
|------|------|------|
| `/` | home.vue | 首页 |
| `/about` | about.vue | 关于页面 |

## 配置说明

### Vite 配置

项目使用 `vite.config.js` 进行配置，包含以下特性：

- **路径别名**：
  - `@` -> `src/`
  - `#` -> `public/`
  - `$` -> `src/components/`

- **自动导入**：集成 `unplugin-auto-import` 和 `unplugin-vue-components`，自动导入 Vue API 和 Naive UI 组件

### 依赖版本

- Vue: ^3.5.32
- Vite: ^8.0.8
- Vue Router: ^5.0.4
- Naive UI: ^2.44.1
- Axios: ^1.15.0

## 浏览器支持

- Chrome >= 88
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

[MIT](LICENSE)

## 作者

[UTAC99645](https://github.com/UTAC99645)
