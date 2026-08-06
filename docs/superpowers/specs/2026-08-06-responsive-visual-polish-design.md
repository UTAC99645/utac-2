# UTAC-2 响应式与视觉打磨 设计文档

日期：2026-08-06
状态：已与用户逐节确认通过

## 背景与目标

对全站（首页 / 关于 / Docs / 404 / Link 预览）做一次**手机 & 电脑分别优化**的响应式布局完善，并在此过程中允许较大幅度的视觉调整——在现有**深色毛玻璃**风格基础上升级为更精致、更克制的玻璃层次、阴影与动效，统一两端体验。

附加需求：新增一个 TypeScript composable，为**桌面鼠标轨迹**（柔和光点拖尾）与**手机触摸**（扩散涟漪/光晕）做视觉美化，全站生效。

## 明确不做的事（边界）

- 不重写 `assets/css/naive-ui-glass.css`（65KB 主题覆盖，仅当某个响应式问题确实需要时做最小修补）
- 不新增任何 npm 依赖
- 不改动现有业务逻辑（搜索、QR、一言、链接预览的 TS 逻辑保持原样）
- 不改变现有功能行为

## 1. 断点体系 + 设计令牌分层（骨架）

统一断点约定（写入 `main.css` 顶部注释，全站共用）：

| 断点 | 规则 |
|---|---|
| 小屏手机 | `@media (max-width: 480px)` |
| 手机 | `@media (max-width: 640px)` |
| 平板 | `@media (max-width: 1024px)` |
| 桌面 | `@media (min-width: 1025px)` |
| 触屏检测 | `@media (hover: none) and (pointer: coarse)` |
| 减少动效 | `@media (prefers-reduced-motion: reduce)` |

在 `main.css` 的媒体查询内做令牌分层：

- **手机（≤640px）**：`--glass-blur` 16→8px、`--glass-blur-sm` 8→4px（移动端性能）；`--bg-card` 透明度 0.45→0.6（浅色背景图下保证白字可读）；字号/间距整体下调
- **平板（641–1024px）**：取中间档
- **桌面（≥1025px）**：保留深模糊、深阴影、发光细节
- 新增 `--fs-*` / `--space-*` 的移动端覆盖，让各页面消费令牌自动适配

## 2. 指针轨迹特效 composable（全站）

新增 `composables/pointerTrail.ts`（Nuxt 自动导入，`app.vue` 中挂载）。

- 创建并复用一个 `position: fixed`、`pointer-events: none` 的叠加层，挂到 `document.body`，只初始化一次
- 按指针类型分流：
  - **桌面**（`mousemove`）：光标处生成柔和光点拖尾，小圆点做「淡入 → 上浮 + 缩放 + 淡出」CSS 动画后移除
  - **手机**（`touchstart/touchmove`）：触点生成扩散的涟漪/光晕，随动画淡出
- 配色与毛玻璃统一：`--color-primary` 系蓝紫、低透明度、柔光
- 性能与降级：
  - 事件节流 + 并发粒子数上限（≤20），`requestAnimationFrame` 回收
  - `prefers-reduced-motion: reduce` 时空操作
  - 挂载监听、卸载 `removeEventListener` 清理
- 粒子的 keyframes/类放入 `main.css`（全局）；composable 只负责生成/回收 DOM 节点并切换类名，不引入依赖
- 对外 API：`usePointerTrail()` 返回 `{ start(), stop(), enabled }`；`app.vue` 的 `onMounted` 调用 `start()`

## 3. 各页面响应式 + 视觉打磨

### 全局修复（`main.css`）
- `img { width:100vw }` → `max-width:100%`（消除横向溢出隐患；about 等页面覆盖保留）
- 面包屑 `4vh` 高度 → 自适应 `min-height`，手机紧凑并允许换行
- `<n-divider>` 手机减小上下边距

### 首页（`home.css`）
- 输入组：桌面 `25/75`；≤640px 改 `40/60`；≤480px 上下堆叠（下拉整行、输入整行）
- 快捷切换按钮：手机加大触控热区 + 间距，允许换行
- 一言卡片：`max-width` 92vw、内边距自适应；桌面保留 hover 抬升
- QR 区域：二维码限宽 `min(325px, 80vw)`；纠错/开关按钮自动换行、加大热区

### 关于页（`about.css`）
- 头像 120 → 手机 96px；间距下调、居中单列

### Docs 页（`docs.css`）
- `doc-diagram` 字号 13→11px、内边距减小、保留横向滚动
- `doc-fields` 手机加横向滚动容器防溢出

### 404 页（`404.css`）
- 细化已有移动端块：玻璃卡更贴合、故障字 ≤640px `5rem`→（≤480px）`3.5rem`、粒子数量按屏宽减量

### Link 预览（`link.css`）
- `glass-header` 手机紧凑、`glass-content` 内边距减小、查看器高度随断点调整、触控热区

## 4. 降级与验证

### 降级
- `prefers-reduced-motion`：在现有基础上补齐新增粒子动画与过渡
- `@supports not (backdrop-filter: blur(1px))`：不支持毛玻璃时回退为更高不透明度实底卡片，保证可读
- 移动端降 `--glass-blur` 已并入第 1 节令牌

### 验证
- `pnpm exec vue-tsc --noEmit` 类型检查通过
- `pnpm build` 构建通过
- 浏览器响应式模式人工核对 360 / 640 / 768 / 1024 / 1440 宽度下各页面无横向溢出、无错位；桌面鼠标拖尾与手机触摸涟漪各验证一次

## 交付物清单

- 修改：`assets/css/main.css`、`home.css`、`about.css`、`docs.css`、`404.css`、`link.css`、`router.css`
- 新增：`composables/pointerTrail.ts`
- 挂载：`app.vue`（引入并 `start()` 轨迹特效）
- 同步更新：`AGENTS.md` 代码组织/开发约定部分（新增 composable 与断点约定说明）
