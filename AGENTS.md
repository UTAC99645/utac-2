# UTAC-2 AGENTS.md

## Project Overview
基于 Vue 3 + TypeScript + Vite 构建的个人主页与搜索聚合应用。支持引擎切换、通用文件查看器、链接预览和 QR 码生成等功能，通过 URL 参数分享搜索状态。公开预览地址：[utac.top](https://utac.top)。

### 技术栈
- Vue 3 (Composition API)
- TypeScript
- Vite (构建工具)
- Vue Router (路由管理)
- Naive UI (按需组件解析)
- Axios (全局请求拦截器)

### 构建与测试
- 开发：`pnpm dev`
- 构建：`pnpm build`
- 预览：`pnpm preview`
- 代码检查：`pnpm lint`

### 代码组织
```
utac-2/
├── public/ (静态资源)
├── src/
│   ├── addition/ (搜索引擎配置)
│   │   ├── searchWay.json (主引擎列表)
│   │   └── mach.ts (配置匹配)
│   ├── components/ (Vue 组件)
│   ├── css/ (CSS 文件)
│   ├── ts/ (TypeScript 类型定义)
│   └── main.vue (根组件)
├── index.html
```

### 开发特性
- URL 解析：`/:type(引擎)?/:query(搜索词)`
- 动态加载引擎配置：`searchWay.json` + `searchKey.json`
- 链接预览支持 Markdown/HTML/PDF 等格式
- QR 码生成支持纠错调整

### 测试策略
- 代码质量：通过 `eslint` 进行语法检查（`pnpm lint`）
- 功能验证：URL 参数一致性与预览准确性

### 安全考虑
- 外部链接预览通过沙盒 iframe 被限制
- 配置文件保留默认引擎列表，新增引擎需手动更新 JSON

## 持续改进建议
- 增加测试覆盖率 (目前仅语法检查)
- 优化引擎配置 JSON 的类型定义
- 扩展文件预览支持的格式类型
