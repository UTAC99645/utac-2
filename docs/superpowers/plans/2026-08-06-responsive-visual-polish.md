# UTAC-2 响应式与视觉打磨 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为全站（首页/关于/Docs/404/Link 预览）建立统一断点体系与响应式令牌分层，分别优化手机与电脑两端显示，并新增一个全站生效的指针轨迹特效 composable（桌面鼠标光点拖尾 + 手机触摸涟漪）。

**Architecture:** 在 `assets/css/main.css` 定义统一断点约定与响应式设计令牌分层（手机/平板/桌面/触屏/减少动效），各页面样式文件消费同一套断点做针对性适配；新增 `composables/pointerTrail.ts`（Nuxt 自动导入）生成并回收 DOM 粒子节点，`app.vue` 挂载全站生效。不动 `naive-ui-glass.css`，不新增依赖。

**Tech Stack:** Nuxt 4 / Vue 3 / TypeScript / Naive UI / 纯 CSS（无预处理器、无测试框架）

## 全局约束

- 断点约定（全站统一）：小屏手机 `max-width:480px`；手机 `max-width:640px`；平板 `max-width:1024px`；桌面 `min-width:1025px`；触屏 `(hover:none) and (pointer:coarse)`；减少动效 `(prefers-reduced-motion:reduce)`
- 不修改 `assets/css/naive-ui-glass.css`
- 不新增任何 npm 依赖；不改动业务逻辑（搜索/QR/一言/链接预览的 TS 逻辑）
- 全站沿用设计令牌（`--color-primary` 等，来自 `main.css` 的 `:root`）
- 验证方式：`pnpm exec vue-tsc --noEmit`（类型）+ `pnpm build`（构建）+ 浏览器响应式模式人工核对
- **所有 `git commit` 必须事先获得用户明确授权，未经授权不得提交**

---

### Task 1: main.css — 统一断点令牌分层 + 全局修复 + 轨迹特效样式

**Files:**
- Modify: `assets/css/main.css`

**Interfaces:**
- Consumes: 无
- Produces: 响应式令牌覆盖（`--glass-blur` / `--glass-blur-sm` / `--bg-card` / `--fs-xl` / `--fs-lg` / `--space-xl` / `h1`）；轨迹层类 `.trail-layer`、`.trail-dot`、`.trail-ripple` 及其 keyframes；`img` 全局规则修正；`@supports not (backdrop-filter)` 回退；`prefers-reduced-motion` 补充

- [ ] **Step 1: 在 `:root` 上方新增统一断点约定注释**

在文件顶部职责注释下方、`:root` 之前插入断点说明块：

```css
/* ---------- 统一断点约定（全站共用，勿各自修改） ----------
   小屏手机  : @media (max-width: 480px)
   手机      : @media (max-width: 640px)
   平板      : @media (max-width: 1024px)
   桌面      : @media (min-width: 1025px)
   触屏检测  : @media (hover: none) and (pointer: coarse)
   减少动效  : @media (prefers-reduced-motion: reduce)
   -------------------------------------------------------- */
```

- [ ] **Step 2: 修正全局 `img` 规则（消除横向溢出隐患）**

把现有 `img` 规则的 `width: 100vw;` 改为 `max-width: 100%;`（其余不变）：

```css
img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-sm);
}
```

- [ ] **Step 3: 新增轨迹特效叠加层与粒子 keyframes**

在文件末尾（`prefers-reduced-motion` 块之前）追加：

```css
/* ---------- 指针轨迹特效（composable: composables/pointerTrail.ts） ---------- */
.trail-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

/* 桌面鼠标：柔和光点拖尾 */
.trail-dot {
  position: fixed;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(123, 142, 216, 0.9), rgba(123, 142, 216, 0));
  box-shadow: 0 0 10px rgba(123, 142, 216, 0.6);
  animation: trailDot 0.7s var(--ease-out) forwards;
}

@keyframes trailDot {
  0%   { opacity: 0.9; transform: scale(0.4); }
  100% { opacity: 0;   transform: scale(1.6) translateY(-12px); }
}

/* 手机触摸：扩散涟漪 */
.trail-ripple {
  position: fixed;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  border: 2px solid rgba(123, 142, 216, 0.7);
  animation: trailRipple 0.8s var(--ease-out) forwards;
}

@keyframes trailRipple {
  0%   { opacity: 0.8; transform: scale(0.2); }
  100% { opacity: 0;   transform: scale(4); }
}
```

- [ ] **Step 4: 在文件末尾追加响应式令牌分层 + 毛玻璃回退 + 减少动效补充**

在现有 `prefers-reduced-motion` 块之后追加：

```css
/* ---------- 平板（641–1024px）：取中间档 ---------- */
@media (max-width: 1024px) {
  :root {
    --glass-blur: 12px;
    --glass-blur-sm: 6px;
  }
}

/* ---------- 手机（≤640px）：降模糊提性能、加深卡片保可读 ---------- */
@media (max-width: 640px) {
  :root {
    --glass-blur: 8px;
    --glass-blur-sm: 4px;
    --bg-card: rgba(25, 30, 60, 0.6);
    --fs-xl: 20px;
    --fs-lg: 16px;
    --space-xl: 28px;
  }
  h1 {
    font-size: 1.9rem;
  }
}

/* ---------- 不支持毛玻璃的浏览器：回退为高不透明度实底 ---------- */
@supports not (backdrop-filter: blur(1px)) {
  .typekey,
  .home-page .n-card,
  .glass-card,
  .glass-header,
  .glass-content,
  .state-card,
  .media-viewer,
  .code-viewer,
  .json-viewer,
  .text-viewer,
  .pdf-viewer,
  .web-viewer {
    background: rgba(25, 30, 60, 0.9);
  }
}
```

- [ ] **Step 5: 把轨迹粒子纳入减少动效开关**

编辑已有 `@media (prefers-reduced-motion: reduce)` 块，把选择器列表扩展为：

```css
@media (prefers-reduced-motion: reduce) {
  .title,
  .home-page .n-card-content,
  .home-page .n-card,
  .typekey,
  .trail-dot,
  .trail-ripple {
    animation: none !important;
    transition: none !important;
  }
  .trail-dot,
  .trail-ripple {
    display: none !important;
  }
}
```

- [ ] **Step 6: 验证**

Run: `pnpm exec vue-tsc --noEmit`
Expected: 无类型错误（本任务纯 CSS，主要目的是确认无语法破坏）

Run: `pnpm build`
Expected: 构建成功

手动：浏览器分别以 1440 / 1024 / 768 / 640 / 360 宽度刷新首页，确认背景图、标题字号、卡片透明度随断点变化且无横向溢出。

- [ ] **Step 7: 提交（需用户授权后执行）**

```bash
git add assets/css/main.css
git commit -m "style: 建立统一断点令牌分层与轨迹特效样式"
```

---

### Task 2: router.css — 面包屑响应式

**Files:**
- Modify: `assets/css/router.css`

**Interfaces:**
- Consumes: 断点约定（≤640px）
- Produces: 面包屑在手机上紧凑且可换行

- [ ] **Step 1: 调整面包屑容器规则**

把 `router.css` 现有 `.n-breadcrumb` 的 `height: 4vh;` 改为 `min-height: 4vh;`，并追加移动端块：

```css
/* ---------- 面包屑容器 ---------- */
.n-breadcrumb {
  font-size: 14px;
  min-height: 4vh;
  padding: var(--space-sm) 14px;
}

/* ---------- 移动端：紧凑并允许换行 ---------- */
@media (max-width: 640px) {
  .n-breadcrumb {
    font-size: 13px;
    min-height: auto;
    padding: var(--space-xs) 10px;
  }
}
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建成功

手动：手机宽度下在首页/关于/Docs 间切换，确认顶部面包屑紧凑、长路径可换行不溢出。

- [ ] **Step 3: 提交（需用户授权后执行）**

```bash
git add assets/css/router.css
git commit -m "style: 面包屑导航移动端适配"
```

---

### Task 3: pointerTrail composable + app.vue 挂载

**Files:**
- Create: `composables/pointerTrail.ts`
- Modify: `app.vue`

**Interfaces:**
- Consumes: Task 1 定义的 `.trail-layer` / `.trail-dot` / `.trail-ripple` 类与 keyframes
- Produces: `usePointerTrail()` 返回 `{ start(), stop(), get enabled() }`

- [ ] **Step 1: 创建 composable**

创建 `composables/pointerTrail.ts`：

```ts
// composables/pointerTrail.ts
// 全站指针轨迹特效：桌面鼠标光点拖尾 / 手机触摸涟漪
// Nuxt 自动导入；在 app.vue 的 onMounted 调用 usePointerTrail().start()

const MAX_PARTICLES = 20;
const SPAWN_INTERVAL_MS = 24;

export function usePointerTrail() {
  let container: HTMLDivElement | null = null;
  let active = 0;
  let lastSpawn = 0;
  let started = false;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensureLayer(): HTMLDivElement {
    if (!container) {
      container = document.createElement("div");
      container.className = "trail-layer";
      document.body.appendChild(container);
    }
    return container;
  }

  function spawn(x: number, y: number, isTouch: boolean) {
    if (!container || active >= MAX_PARTICLES) return;
    const el = document.createElement("span");
    el.className = isTouch ? "trail-ripple" : "trail-dot";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    container.appendChild(el);
    active++;
    const done = () => {
      el.removeEventListener("animationend", done);
      el.remove();
      active--;
    };
    el.addEventListener("animationend", done);
  }

  function onMouseMove(e: MouseEvent) {
    const now = performance.now();
    if (now - lastSpawn < SPAWN_INTERVAL_MS) return;
    lastSpawn = now;
    spawn(e.clientX, e.clientY, false);
  }

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (t) spawn(t.clientX, t.clientY, true);
  }

  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (t) spawn(t.clientX, t.clientY, true);
  }

  function start() {
    if (started) return;
    if (reduceMotion()) return;
    ensureLayer();
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    started = true;
  }

  function stop() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    if (container) {
      container.innerHTML = "";
      container.remove();
      container = null;
    }
    started = false;
    active = 0;
  }

  return {
    start,
    stop,
    get enabled() {
      return started;
    }
  };
}
```

- [ ] **Step 2: 在 app.vue 挂载**

在 `app.vue` 的 `<script setup lang="ts">` 中，`import "./assets/css/router.css";` 下方新增，并在文件内已有逻辑末尾（如 `way` 定义之后）挂载：

```ts
// 全站指针轨迹特效（桌面鼠标拖尾 / 手机触摸涟漪）
const { start: startTrail } = usePointerTrail();

onMounted(() => {
  startTrail();
});
```

（`usePointerTrail` 与 `onMounted` 均由 Nuxt 自动导入，无需手动 import。）

- [ ] **Step 3: 验证**

Run: `pnpm exec vue-tsc --noEmit`
Expected: 无类型错误

Run: `pnpm build`
Expected: 构建成功

手动：桌面移动鼠标，光标出现蓝色光点拖尾；切换响应式模式到手机并触摸，触点出现扩散涟漪；开启系统"减弱动态效果"后不再出现粒子。

- [ ] **Step 4: 提交（需用户授权后执行）**

```bash
git add composables/pointerTrail.ts app.vue
git commit -m "feat: 全站指针轨迹特效（鼠标拖尾 / 触摸涟漪）"
```

---

### Task 4: 首页响应式（home.css + index.vue 内联宽度清理）

**Files:**
- Modify: `assets/css/home.css`
- Modify: `pages/index.vue:30-31`（去掉 n-select / n-input 的内联宽度）

**Interfaces:**
- Consumes: 断点约定
- Produces: 首页搜索输入组在桌面 25/75、手机 40/60、小屏手机上下堆叠

- [ ] **Step 1: 去掉 index.vue 的内联宽度（改为 CSS 控制）**

把 `pages/index.vue` 中：

```html
<n-select style="width: 25%" v-model:value="search_type" :options="searchkey" size="large" />
<n-input style="width: 75%" v-model:value="searchText" clearable size="large" />
```

改为（移除内联 `style="width: 25%"` 与 `style="width: 75%"`）：

```html
<n-select v-model:value="search_type" :options="searchkey" size="large" />
<n-input v-model:value="searchText" clearable size="large" />
```

- [ ] **Step 2: 在 home.css 中补输入组宽度规则与响应式**

在 `home.css` 的 `.home-page .n-input-group` 规则附近新增基础宽度，并扩展现有 `@media (max-width: 640px)` 块，追加 `@media (max-width: 480px)`：

```css
/* 输入组：引擎下拉 / 关键词输入 宽度比例（由 CSS 控制，默认桌面 25/75） */
.home-page .n-input-group .n-select { width: 25%; }
.home-page .n-input-group .n-input { width: 75%; }

/* 手机：40/60 */
@media (max-width: 640px) {
  .home-page .n-input-group .n-select { width: 40%; }
  .home-page .n-input-group .n-input { width: 60%; }
}

/* 小屏手机：上下堆叠 */
@media (max-width: 480px) {
  .home-page .n-input-group {
    flex-direction: column;
    width: 92vw;
  }
  .home-page .n-input-group .n-select,
  .home-page .n-input-group .n-input {
    width: 100%;
  }
}
```

- [ ] **Step 3: 手机端触控反馈 + 快捷按钮间距**

在 `home.css` 追加（放在已有内容末尾）：

```css
/* 触屏设备：关闭 hover 抬升，改用按压反馈 */
@media (hover: none) and (pointer: coarse) {
  .typekey:hover,
  .home-page .n-card:hover {
    transform: none;
  }
  .typekey:active {
    transform: scale(0.96);
  }
}

/* 手机：快捷切换按钮间距与热区 */
@media (max-width: 640px) {
  .home-page .typekey {
    margin: var(--space-xs);
  }
}
```

- [ ] **Step 4: QR 二维码限宽**

在 `home.css` 追加：

```css
@media (max-width: 640px) {
  .home-page #qrcode {
    max-width: min(325px, 80vw);
    height: auto;
  }
}
```

- [ ] **Step 5: 验证**

Run: `pnpm exec vue-tsc --noEmit`
Expected: 无类型错误

Run: `pnpm build`
Expected: 构建成功

手动：桌面宽度下拉/输入为 25/75；640px 为 40/60；480px 上下堆叠；QR 模式二维码不超出屏幕；触屏模式下无 hover 抬升、按压有缩放反馈。

- [ ] **Step 6: 提交（需用户授权后执行）**

```bash
git add assets/css/home.css pages/index.vue
git commit -m "style: 首页搜索/快捷按钮/二维码移动端适配"
```

---

### Task 5: 关于页响应式（about.css）

**Files:**
- Modify: `assets/css/about.css`

**Interfaces:**
- Consumes: 断点约定
- Produces: 关于页手机端头像缩小、间距紧凑

- [ ] **Step 1: 追加移动端块**

在 `about.css` 末尾追加：

```css
/* ---------- 移动端：头像缩小、间距紧凑 ---------- */
@media (max-width: 640px) {
  .about-page img {
    width: 96px;
    height: 96px;
  }
  .about-page div {
    margin-bottom: var(--space-md);
  }
}
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建成功

手动：手机宽度下关于页头像约 96px、单列居中、间距合理。

- [ ] **Step 3: 提交（需用户授权后执行）**

```bash
git add assets/css/about.css
git commit -m "style: 关于页移动端适配"
```

---

### Task 6: Docs 页响应式（docs.css）

**Files:**
- Modify: `assets/css/docs.css`

**Interfaces:**
- Consumes: 断点约定
- Produces: 手机端图解更小、字段表横向滚动

- [ ] **Step 1: 追加移动端块**

在 `docs.css` 末尾追加：

```css
/* ---------- 移动端：图解紧凑、字段表横向滚动防溢出 ---------- */
@media (max-width: 640px) {
  .doc-diagram {
    font-size: 11px;
    padding: var(--space-sm) var(--space-md);
  }
  .doc-fields {
    display: block;
    overflow-x: auto;
  }
  .doc-fields th,
  .doc-fields td {
    white-space: nowrap;
  }
}
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建成功

手动：手机宽度下 Docs 页代码图解可读、字段表可横向滑动、无页面级横向溢出。

- [ ] **Step 3: 提交（需用户授权后执行）**

```bash
git add assets/css/docs.css
git commit -m "style: Docs 页移动端适配"
```

---

### Task 7: 404 页响应式（404.css）

**Files:**
- Modify: `assets/css/404.css`

**Interfaces:**
- Consumes: 断点约定（≤640px / ≤480px）
- Produces: 手机端玻璃卡更贴合、小屏故障字缩小、粒子减量

- [ ] **Step 1: 追加小屏与粒子减量规则**

在 `404.css` 已有 `@media (max-width: 640px)` 块内或其后追加：

```css
/* 手机：粒子减量（每 2 个显示 1 个）以降低动画开销 */
@media (max-width: 640px) {
  .particle:nth-child(n + 11) {
    display: none;
  }
}

/* 小屏手机：故障字进一步缩小 */
@media (max-width: 480px) {
  .glitch {
    font-size: 3.5rem;
  }
}
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建成功

手动：手机宽度访问任意 404 路径，玻璃卡不溢出、404 字样适配、粒子减少；小屏下故障字约 3.5rem。

- [ ] **Step 3: 提交（需用户授权后执行）**

```bash
git add assets/css/404.css
git commit -m "style: 404 页移动端适配"
```

---

### Task 8: Link 预览响应式（link.css）

**Files:**
- Modify: `assets/css/link.css`

**Interfaces:**
- Consumes: 断点约定
- Produces: 手机端预览头部紧凑、内容内边距减小、查看器更矮

- [ ] **Step 1: 在已有 `@media (max-width: 768px)` 之后追加手机块**

在 `link.css` 末尾追加：

```css
/* 手机（≤640px）：紧凑布局 */
@media (max-width: 640px) {
  .glass-header {
    padding: var(--space-xs) var(--space-md);
    gap: var(--space-sm);
  }
  .glass-content {
    padding: var(--space-md);
  }
  .web-viewer,
  .pdf-viewer {
    height: 45vh;
  }
  .media-viewer img {
    max-height: 45vh;
  }
  .markdown-body h1 {
    font-size: 22px;
  }
}
```

- [ ] **Step 2: 验证**

Run: `pnpm build`
Expected: 构建成功

手动：手机宽度下打开一个链接预览（如 markdown/网页），顶部栏紧凑、内容不溢出、查看器高度约 45vh。

- [ ] **Step 3: 提交（需用户授权后执行）**

```bash
git add assets/css/link.css
git commit -m "style: 链接预览移动端适配"
```

---

### Task 9: 更新 AGENTS.md 约定 + 全量验证

**Files:**
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: 全部分析结论
- Produces: 文档与实现一致

- [ ] **Step 1: 更新 AGENTS.md 代码组织与开发约定**

在 `AGENTS.md` 的"代码组织"的 `composables/` 条目下补充 `pointerTrail.ts`（全站指针轨迹特效），并在"开发约定"中补充统一断点约定（手机 480/640、平板 1024、桌面 1025、触屏、减少动效）与"不改动 `naive-ui-glass.css`"的说明。

- [ ] **Step 2: 全量类型检查 + 构建**

Run: `pnpm exec vue-tsc --noEmit`
Expected: 无类型错误

Run: `pnpm build`
Expected: 构建成功

- [ ] **Step 3: 全页面响应式人工核对**

按 360 / 640 / 768 / 1024 / 1440 宽度逐页核对：首页、关于、Docs、404（任意路径）、Link 预览。确认：无横向溢出、无元素错位/重叠、手机端触控热区可用、桌面端 hover 与轨迹特效正常、减少动效下动画关闭。

- [ ] **Step 4: 提交（需用户授权后执行）**

```bash
git add AGENTS.md
git commit -m "docs: 更新断点约定与轨迹特效说明"
```

---

## 自审记录

- 规范覆盖：第 1 节断点/令牌 → Task 1；第 2 节轨迹特效 → Task 1(样式) + Task 3(composable)；第 3 节各页面 → Task 2/4/5/6/7/8；第 4 节降级/验证 → Task 1(回退+减少动效) + Task 9(全量验证)。无遗漏。
- 占位符检查：所有代码步骤均含完整实现代码，无 TBD/TODO。
- 类型一致性：`usePointerTrail()` 返回 `{ start, stop, enabled }`，Task 3 中 `app.vue` 解构 `start` 为 `startTrail`，一致。
- 断点一致性：全计划统一使用 480/640/1024/1025 与 `(hover:none) and (pointer:coarse)`，与规范一致。
