# 全局毛玻璃质感打磨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在零模板改动前提下，通过扩展设计令牌并统一 5 个 CSS 文件，打磨全站毛玻璃质感（重点：搜索页、一言卡片、404）。

**Architecture:** 以 `assets/css/main.css` 的 `:root` 为令牌中心，新增玻璃/边框/焦点/字号/缓动令牌；`home.css`、`404.css`、`link.css`、`about.css` 分别将硬编码值替换为令牌并补充交互细节与窄屏断点。全部为 CSS 层改动，模板/配置/逻辑零改动。

**Tech Stack:** CSS 自定义属性（design tokens）、`backdrop-filter`、媒体查询、`prefers-reduced-motion`。无新依赖。

## Global Constraints

- 模板、Nuxt 配置、逻辑代码零改动（只允许动 `assets/css/*.css`）
- 不改 `assets/css/naive-ui-glass.css`（组件级主题已自成体系）
- 不改 main.css 既有令牌值（只新增）
- 保持蓝紫冷调毛玻璃风格，不引入新色相
- 新增动效必须纳入 `prefers-reduced-motion: reduce` 关闭范围
- 无新增依赖；验证方式：`npx vue-tsc --noEmit -p tsconfig.json` 通过 + 目视检查
- git 提交步骤执行前需先与用户确认（本项目会话规则：不主动执行 git 操作）

---

### Task 1: 设计令牌扩展（main.css）

**Files:**
- Modify: `assets/css/main.css:10-53`（`:root` 块内追加）

**Interfaces:**
- Produces: 全局 CSS 变量 `--glass-blur` / `--glass-blur-sm` / `--glass-saturate` / `--border-subtle` / `--border-hover` / `--focus-ring` / `--fs-sm` / `--fs-md` / `--fs-lg` / `--fs-xl` / `--ease-out`，供 Task 2-4 使用

- [ ] **Step 1: 读取当前 `:root` 块**

Read `assets/css/main.css` 第 10-53 行，确认现有令牌结尾（`--transition-base: 0.3s ease;` 之后为 `}`）。

- [ ] **Step 2: 在 `:root` 内追加令牌**

在 `--transition-base: 0.3s ease;` 之后、闭合 `}` 之前插入：

```css
  /* 玻璃效果 */
  --glass-blur: 16px;
  --glass-blur-sm: 8px;
  --glass-saturate: 160%;

  /* 边框层级 */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(255, 255, 255, 0.2);

  /* 焦点环 */
  --focus-ring: 0 0 0 3px rgba(123, 142, 216, 0.35);

  /* 字号层级 */
  --fs-sm: 13px;
  --fs-md: 15px;
  --fs-lg: 18px;
  --fs-xl: 24px;

  /* 动效曲线 */
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
```

- [ ] **Step 3: 验证**

Run: `grep -c -- "--glass-blur\|--border-subtle\|--focus-ring\|--fs-xl\|--ease-out" assets/css/main.css`
Expected: 5（每组令牌至少出现一次：定义处）

- [ ] **Step 4: Commit**

```bash
git add assets/css/main.css
git commit -m "style: extend design tokens in main.css"
```
（执行前先与用户确认）

---

### Task 2: 首页样式打磨（home.css — 搜索页 + 一言卡片）

**Files:**
- Modify: `assets/css/home.css`（全文 33 行，整体重写为下方内容）

**Interfaces:**
- Consumes: Task 1 的令牌 `--glass-blur-sm` / `--glass-saturate` / `--border-subtle` / `--border-hover` / `--focus-ring` / `--ease-out` / `--shadow-md`
- Produces: `.home-page` 内搜索框流式居中布局、引擎按钮 hover、一言卡片 hover、窄屏断点

- [ ] **Step 1: 读取文件确认现状**

Read `assets/css/home.css`（33 行），确认 `.home-page .n-input` 当前为 `position: absolute; top: 50%; left: 50%` 硬定位。

- [ ] **Step 2: 重写 home.css**

将文件整体替换为：

```css
/* ============================================================
   首页样式文件
   注意：部分选择器为全局范围，会作用于页面内所有匹配元素
   ============================================================ */

/* ---------- 搜索输入框 ----------
   注意：naive-ui 组件实际渲染为 div.n-input 等类名元素，
   且限定在首页根容器 .home-page 内，避免污染其他页面
   ---------------------------------------------------------- */
.home-page .n-input,
.home-page .n-select,
.home-page .n-input-group {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.35));
}

/* 搜索表单：流式布局水平居中（替代原 absolute 硬定位，避免遮挡标题/卡片） */
.home-page form {
  display: flex;
  justify-content: center;
}

/* 输入组整体限宽，窄屏自适应收缩 */
.home-page .n-input-group {
  width: min(76vw, 660px);
}

/* 焦点态：统一光晕（focus-within 兼容 select 内部 input） */
.home-page .n-input:focus-within,
.home-page .n-select:focus-within {
  box-shadow: var(--focus-ring);
}

/* ---------- 页面标题：入场动画 ---------- */
.title {
  animation: fadeIn 0.8s var(--ease-out) both;
}

/* ---------- 引擎切换按钮 ---------- */
.typekey {
  border-radius: var(--radius-md);
  backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-saturate));
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.25s var(--ease-out),
    box-shadow 0.25s var(--ease-out),
    border-color 0.25s var(--ease-out);
}

.typekey:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

/* ---------- 一言卡片：限宽居中 + hover 抬升 ---------- */
.home-page .n-card {
  max-width: 640px;
  margin: 0 auto;
  transition:
    transform 0.3s var(--ease-out),
    border-color 0.3s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}

.home-page .n-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

/* 卡片内容入场（naive-ui 类名：n-card-content） */
.home-page .n-card-content {
  animation: fadeInScale 0.6s var(--ease-out) both;
}

/* header（by/from）与 action（ID + 按钮）：次要信息弱化
   （naive-ui 类名：header 为 n-card-header，action 为 n-card__action） */
.home-page .n-card-header,
.home-page .n-card__action {
  font-size: var(--fs-sm);
  opacity: 0.85;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .home-page .n-input-group {
    width: 92vw;
  }

  .home-page .n-card {
    max-width: 92vw;
  }
}
```

- [ ] **Step 3: 验证**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: exit 0（模板未动，类型不应变化）

Run: `grep -c "absolute\|!important" assets/css/home.css`
Expected: 0（硬定位与 !important 已移除）

- [ ] **Step 4: Commit**

```bash
git add assets/css/home.css
git commit -m "style: polish home page search bar and yiyan card"
```
（执行前先与用户确认）

---

### Task 3: 404 页面令牌化与打磨（404.css）

**Files:**
- Modify: `assets/css/404.css`（全文 337 行，按下方修改点逐处编辑）

**Interfaces:**
- Consumes: Task 1 的令牌 `--font-body` / `--radius-xl` / `--glass-blur` / `--glass-saturate` / `--border-subtle` / `--border-hover` / `--shadow-md` / `--ease-out`
- Produces: 令牌化的 404 页面 + 卡片 hover 光晕 + 按钮按压反馈

- [ ] **Step 1: 逐处替换（按下列修改点逐个 Edit）**

1. `.not-found-page` 的 `font-family: 'Maple Mono NF', ...` 整行 → `font-family: var(--font-body);`
2. `.glass-card` 中：
   - `border-radius: 24px;` → `border-radius: var(--radius-xl);`
   - `backdrop-filter: blur(20px) saturate(180%);` 与 `-webkit-backdrop-filter: ...` → `blur(var(--glass-blur)) saturate(var(--glass-saturate))`
   - `border: 1px solid rgba(255, 255, 255, 0.18);` → `border: 1px solid var(--border-hover);`
   - `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);` → `box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.15);`
   - 在该规则末尾追加 hover 光晕：
   ```css
   .glass-card:hover {
     box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 40px rgba(144, 238, 144, 0.12);
   }
   ```
3. `.glitch` 的 text-shadow 第三层 `0 0 80px rgba(144, 238, 144, 0.2)` → `0 0 80px rgba(144, 238, 144, 0.35)`（故障字绿色光晕微增强，呼应卡片 hover）
4. `.btn-primary:hover` / `.btn-secondary:hover` 之后各追加 active 按压反馈：
   ```css
   .btn-primary:active,
   .btn-secondary:active {
     transform: translateY(0) scale(0.97);
   }
   ```
5. `.btn-primary` / `.btn-secondary` 的 `transition: all 0.3s ease;` → `transition: transform 0.25s var(--ease-out), box-shadow 0.25s var(--ease-out);`（btn-primary 同时保留 box-shadow 变化）

- [ ] **Step 2: 说明（无需修改项）**

- `.bg-image::after` 遮罩渐变与 `.glitch` 故障色保留硬编码：前者是中性黑遮罩（与蓝紫页面遮罩用途不同），后者是特效色板，令牌化收益为零
- 其余小色值（按钮渐变、粒子白）为 404 特有设计，保留

- [ ] **Step 3: 验证**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: exit 0

Run: `grep -c "Maple Mono NF" assets/css/404.css`
Expected: 0（字体栈已统一）

Run: `grep -n "blur(20px)\|rgba(255, 255, 255, 0.18)\|8px 32px" assets/css/404.css`
Expected: 无输出（令牌化完成）

- [ ] **Step 4: Commit**

```bash
git add assets/css/404.css
git commit -m "style: tokenize and polish 404 page"
```
（执行前先与用户确认）

---

### Task 4: Link / About 样式统一（link.css + about.css）

**Files:**
- Modify: `assets/css/link.css`
- Modify: `assets/css/about.css`

**Interfaces:**
- Consumes: Task 1 的令牌 `--glass-blur` / `--glass-saturate` / `--border-subtle`
- Produces: 查看器卡片与 about 页面统一玻璃质感；修复全局 `img { width: 100vw }` 对 about 头像的破坏

- [ ] **Step 1: link.css 三处替换**

1. `.glass-header` 规则中：`backdrop-filter: blur(12px);` + `-webkit-backdrop-filter: blur(12px);` → `blur(var(--glass-blur)) saturate(var(--glass-saturate))`（两行同改）；`border: 1px solid rgba(255, 255, 255, 0.08);` → `border: 1px solid var(--border-subtle);`
2. `.state-card` 规则：同样替换 blur(12px) 两行与 `rgba(255, 255, 255, 0.08)` 边框
3. `.glass-content` 规则：同样替换 blur(12px) 两行与 `rgba(255, 255, 255, 0.08)` 边框

（`#CA4346` 类的 fallback 色值保留——仅当令牌缺失时生效，属兜底写法）

- [ ] **Step 2: about.css 头像修复与统一**

在 `about.css` 的 `/* ---------- 名称 ---------- */` 之前插入头像规则：

```css
/* ---------- 头像 ----------
   覆盖 main.css 的全局 img 规则（width: 100vw），
   头像应为固定尺寸圆形
   ---------------------------------------------------------- */
.about-page img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-sm);
}
```

- [ ] **Step 3: 验证**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: exit 0

Run: `grep -n "blur(12px)\|rgba(255, 255, 255, 0.08)" assets/css/link.css`
Expected: 无输出

Run: `grep -n "about-page img" assets/css/about.css`
Expected: 命中头像规则

- [ ] **Step 4: Commit**

```bash
git add assets/css/link.css assets/css/about.css
git commit -m "style: unify glass tokens in link/about pages"
```
（执行前先与用户确认）

---

### Task 5: 全局验证与收尾

**Files:** 无（只读检查）

- [ ] **Step 1: 类型检查**

Run: `npx vue-tsc --noEmit -p tsconfig.json`
Expected: exit 0

- [ ] **Step 2: 令牌一致性扫描**

Run: `grep -rn "backdrop-filter: blur([0-9]" assets/css/ | grep -v naive-ui-glass`
Expected: 无输出（除 naive-ui-glass.css 外，模糊值均走令牌）

- [ ] **Step 3: reduced-motion 覆盖检查**

Run: `grep -n "prefers-reduced-motion" assets/css/404.css assets/css/main.css`
Expected: 404.css 命中（新增动效：.glass-card:hover 无动画、无问题；404 已有 reduce 规则覆盖全部动画）；确认 `home.css` 新增的 `fadeIn` / `fadeInScale` / 过渡在 reduce 下关闭 —— 在 `main.css` 追加：

```css
/* ---------- 减少动画偏好：统一关闭 ---------- */
@media (prefers-reduced-motion: reduce) {
  .title,
  .home-page .n-card-content,
  .home-page .n-card,
  .typekey {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 4: 目视检查清单（用户预览）**

Run: `pnpm dev` 后请用户检查：
- 搜索页：输入框居中不遮标题，320px 与 1920px 宽度均正常；引擎按钮 hover 上浮
- 一言卡片：限宽居中，hover 抬升
- 404 页：卡片字体/圆角/阴影与全站一致，hover 绿色光晕
- About 页：头像为 120px 圆形，不再拉伸为视口宽度
- Link 预览：各查看器卡片玻璃质感与首页一致
- 系统开启"减少动态效果"时所有新增动效静止

- [ ] **Step 5: Commit**

```bash
git add assets/css/main.css
git commit -m "style: disable new motion under prefers-reduced-motion"
```
（执行前先与用户确认）
