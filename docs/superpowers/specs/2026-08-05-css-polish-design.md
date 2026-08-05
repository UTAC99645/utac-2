# 全局毛玻璃质感打磨 — 设计文档

日期：2026-08-05
状态：已获用户批准（范围=全局统一优化；方向=质感打磨；思路=令牌驱动）

## 目标

在保持现有蓝紫冷调毛玻璃风格与页面结构不变的前提下，统一全站视觉语言，重点打磨搜索页、一言卡片、404 页面三个用户点名位置。所有改动均为 CSS 层，模板、配置、逻辑零改动。

## 背景

当前问题：

- `home.css` 搜索框使用 `position: absolute; top: 50%` 硬定位，宽高硬编码（75vw / 5vh），会覆盖标题区域、窄屏错位
- 各 CSS 文件存在大量硬编码色值、圆角、阴影，与 `main.css` / `naive-ui-glass.css` 的令牌不一致（如 404.css 的字体栈 `'Maple Mono NF'` 与全局 `MapleMono` 不同）
- `home.css` 中 `.typekey` 使用 `!important` 覆盖
- 一言卡片全宽拉伸，层次感弱
- 响应式断点数值不统一

## 1. 设计令牌扩展（main.css）

现有令牌保持不变，仅新增：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--glass-blur` | `16px` | 卡片/容器标准模糊 |
| `--glass-blur-sm` | `8px` | 小元素（按钮、标签）模糊 |
| `--glass-saturate` | `160%` | 统一饱和度 |
| `--border-subtle` | `rgba(255,255,255,.08)` | 默认边框 |
| `--border-hover` | `rgba(255,255,255,.20)` | hover 边框 |
| `--focus-ring` | `0 0 0 3px rgba(123,142,216,.35)` | 控件聚焦光晕 |
| `--fs-sm / --fs-md / --fs-lg / --fs-xl` | `13px / 15px / 18px / 24px` | 字号层级 |
| `--ease-out` | `cubic-bezier(.22,.61,.36,1)` | 统一缓动曲线 |

## 2. 搜索页（home.css）

- 搜索框：去除 absolute 硬定位，改为流式布局（标题→输入框→分隔线→按钮自然堆叠），宽度 `min(72vw, 640px)`，高度自适应
- 标题：加入场 `fadeIn` 动画与柔和光晕
- 引擎按钮 `.typekey`：去掉 `!important`，hover 上浮 + 光晕，激活态与虚线态区分加强；窄屏允许换行

## 3. 一言卡片（home.css）

- 限宽居中：`max-width: 640px`
- hover 抬升 + 边框提亮
- 内容入场 `fadeInScale`
- header（by/from）与 action（ID + 按钮）排版对齐，次要信息弱化

## 4. 404 页面（404.css）

- 全文件令牌化：字体栈统一 `MapleMono`；圆角/边框/阴影/遮罩色改用令牌
- 卡片 hover 光晕增强、按钮 active 按压下沉反馈
- 故障字结构不变，仅微调色层与动画时长

## 5. Link / About 统一（link.css / about.css）

- `link.css`：各查看器卡片统一到玻璃令牌（blur / saturate / 边框），标题与按钮层级对齐
- `about.css`：头像圆角/阴影居中化，列表间距统一

## 6. 响应式

- 断点对齐：640 / 768 / 1024
- 重点补搜索框与一言卡片窄屏表现
- 新增动效全部纳入 `prefers-reduced-motion: reduce` 关闭范围

## 改动文件

- `assets/css/main.css`（令牌扩展）
- `assets/css/home.css`（搜索页 + 一言卡片）
- `assets/css/404.css`（令牌化 + 细节打磨）
- `assets/css/link.css`（玻璃令牌统一）
- `assets/css/about.css`（细节统一）

## 验收标准

1. 页面结构与模板零改动（除注释外，若确有需要可向用户说明）
2. 搜索框在 320px ~ 1920px 宽度下居中不错位、不遮挡标题
3. 四个页面视觉元素（圆角、边框、模糊、阴影、动效）使用同一令牌来源
4. `prefers-reduced-motion` 下新增动效全部关闭
5. `vue-tsc --noEmit` 通过（模板未动，应无类型变化）
6. 无新增依赖

## 不做的事

- 不改页面结构与模板
- 不改 naive-ui-glass.css（组件级主题已自成体系）
- 不改设计令牌既有值（避免破坏现有主题）
- 不加图片/字体等资源依赖
