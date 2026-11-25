# 常见问题与坑位速查（TROUBLESHOOTING）

> 按"症状 → 根因 → 处方"组织。新坑修完记得补进这份文件。

## 构建 / 部署

### Cloudflare Pages build:failure："Invalid package manager specification"
- 根因：`package.json` 的 `packageManager` 写了 `pnpm@latest`，CI 只认精确 semver
- 处方：钉死精确版本（现值 `pnpm@12.21.0`），确保与 `pnpm-lock.yaml` 同步
  （lockfile 报 not up to date 就本地 `pnpm install` 重新生成并提交）

### pnpm install 报 "Cannot update packageManagerDependencies with frozen-lockfile"
- 根因：`packageManager` 版本与 lockfile 记录不一致
- 处方：`pnpm install`（不带 --frozen-lockfile）更新 lockfile，检查 diff 后提交

### 本地 `node .output/server/index.mjs` 报 MODULE_NOT_FOUND
- 根因：上一次 `pnpm build` 被 signal 打断，`.output` 撕裂（public 有、server 无）
- 处方：删除 `.output` 重新完整构建

### 改了 Pages Function / 环境变量但线上没变化
- 根因：deployment_configs 只在新部署时生效
- 处方：推空提交触发部署（`git commit --allow-empty -m 'chore: redeploy' && git push`）

## SSR / 运行时

### 首页 500："Cannot read properties of undefined (reading 'head')"
- 根因：`nuxt.config.ts` 配了 `app.head`（本 Nuxt 5 nightly 不支持）
- 处方：删掉，改用 `app.vue` 里 `useHead()` 注入

### 首页 500："document is not defined"（日志只见 "Cannot assign to read only property 'stack'"）
- 根因：naive-ui Select / vueuc Follower 等 SSR 渲染时触碰浏览器 DOM；
  dev 模式原始错误被 `ssrFixStacktrace` 吞掉，只剩改 stack 失败的次生错误
- 处方：这类 UI 用 `<ClientOnly>` 包裹（首页主内容已是范例）；
  自研代码确保 `document/window` 只出现在 `onMounted` / 事件回调里
- 定位：构建后在 `.output/server/_ssr/*.mjs` 里 `rg '\(void 0\)\.head'`（即 document.head）

### 页面渲染出来但元素"隐身"
- 大概率是无头浏览器截图假象，不是真 bug：
  1. 入场动画（fadeIn 等）抓在第一帧
  2. 整页截图重启 CSS 动画
  3. 视口覆盖后 `100vw` 不跟随 → 容器宽度是假象
- 处方：`getComputedStyle` 查 opacity / 尺寸为准；等动画播完再截

## 样式

### 面包屑在导航条里出现"玻璃叠玻璃"圆角深块
- 根因：`naive-ui-glass.css` 给 `.n-breadcrumb` 自带独立玻璃底
- 处方：已用 `.site-nav .n-breadcrumb` 覆盖为透明；新建含面包屑的容器时同理处理

### 手机端横向溢出
- 处方：先 `document.documentElement.scrollWidth vs clientWidth` 确认，
  再遍历元素找 `getBoundingClientRect().right > clientWidth` 的家伙；
  导航类内容用 `overflow-x: auto` 单行滑动 + `min-width: 0` 允许 flex 收缩
- 面包屑/预览区等长内容已处理，新增顶部区域时照抄 router.css 的移动端规则

## 数据 / 接口

### 统计页显示"示例数据"标签
- 链路：`statistics.vue` → `/api/stats` → CF GraphQL Analytics
- 排查顺序：线上 `curl https://utac.top/api/stats`（ok:false 则看 error 字段）→
  Pages 环境变量 `CF_STATS_TOKEN` 是否配置（production+preview 都要）→ Token 权限
  （Zone → Analytics → Read）
- 前端本身失败自动回退演示数据，属设计行为

### About 页卡在"加载中..."
- 根因：远程 `file.utac.top/Web/utac/json/about.json` 拉取失败
- 注意：列表初始为空数组时确实只显示"加载中..."；如需完全容错可加常驻兜底条目

## 沙箱开发环境（Minis 内）

### pkill 杀服务器时命令自杀
- 根因：`pkill -f 'index.mjs'` 会匹配到包含该字符串的当前命令行本身
- 处方：`pkill -f '[i]ndex\.mjs'`，且**拆成两条命令**执行（杀完再单独启动）；
  等待用 `shell_execute` 的 delay 参数，不要 sleep 占进程

### file 仓库克隆超时
- 根因：仓库全是几十 MB 的图片
- 处方：稀疏克隆（见 DEPLOYMENT.md）

## git / 网络

### push 被拒 "email privacy restrictions"
- 处方：提交身份用 `UTAC99645 <UTAC99645@users.noreply.github.com>`

### SSH push 偶发 120s 超时（signal 9）
- 处方：重试一次即可；SSH 走 ssh.github.com:443
