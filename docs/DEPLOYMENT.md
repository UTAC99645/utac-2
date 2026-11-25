# 部署指南（DEPLOYMENT）

## 拓扑

| 项目 | 仓库 / 分支 | 地址 | 内容 |
| --- | --- | --- | --- |
| utac-2 | UTAC99645/utac-2 @ **main** | utac.top（utac-2.pages.dev） | Nuxt SSR 全站 + Pages Function |
| file | UTAC99645/file @ **master** | file.utac.top（file-b04.pages.dev） | 静态资源（背景、字体历史包、about.json） |

两边都是 Cloudflare Pages **Git 集成**：推送即自动构建部署。

## utac-2 构建配置（Cloudflare Pages）

- Build command：`pnpm nuxt build`（输出 `.output`，含 SSR server）
- `packageManager` 必须是**精确 semver**：`pnpm@12.21.0`（写 `latest` 会
  `Invalid package manager specification` → build:failure）
- pnpm lockfile（v9 / lockfileVersion 12.x 时代）与 `packageManager` 必须一致，
  否则 `--frozen-lockfile` 失败（2026-11-24 已对齐）
- 环境变量（production + preview 都要配）：
  - `CF_STATS_TOKEN`：Cloudflare API Token，仅需 `Zone → Analytics → Read`，
    供 `/api/stats` 使用；**改动后需要新部署才生效**（可推空提交触发）

## Pages Function：/api/stats

- 源码：`functions/api/stats.js`，运行在 Nitro Pages 兼容层
- 职责：服务端代理 Cloudflare GraphQL Analytics（30 天），响应缓存 10 分钟
- GraphQL 坑位备忘：
  - 按天：`httpRequests1dGroups`（`date_geq/date_leq` 过滤，`sum{requests pageViews}`，
    `uniq{uniques}`，`orderBy date_ASC`）
  - 按路径：`httpRequestsAdaptiveGroups` 的 `sum` 里**没有** `requests/pageViews`，
    只有 `sum{visits}`；且 `orderBy` 不支持 `sum_requests_DESC`（拉回后客户端排序）
  - 不确定字段就内省：`__type(name:"...")`
- 降级：无 Token / API 失败 → `ok:false`，前端回退演示数据

## 发布流程（标准）

1. 本地验证：`pnpm typecheck` → `pnpm build` → `node .output/server/index.mjs`
   → curl 冒烟 `/`、`/statistics`、`/docs`、`/about`、乱路径（404）
2. 提交并推送：`git push origin main`
3. 等 Cloudflare 自动部署（build 约 2-4 分钟），查状态：
   `GET /accounts/{account_id}/pages/projects/utac-2/deployments` 看 `latest_stage`
4. 线上验收：curl 线上页面 / 资源，浏览器实测关键交互

## git 注意

- 提交身份用 `UTAC99645 <UTAC99645@users.noreply.github.com>`
  （GitHub 拒绝隐私邮箱直推会报 email privacy restrictions）
- SSH push 走 `ssh.github.com:443`，偶发 120s 超时，重试一次即可
- 沙箱内执行示例：`git -c user.name='UTAC99645' -c user.email='...' commit ...`

## 回滚

- Cloudflare Pages 控制台选上一个 success 部署 → "Rollback to this deployment"（即时生效）
- 代码层回滚：`git revert <commit>` 后推送，让 CI 重新部署

## 静态资源站（file 仓库）

- **分支是 master 不是 main**：`git push origin master`
- 仓库全是大图片，整库克隆会超时；稀疏克隆：
  ```bash
  git clone --depth 1 --filter=blob:none --sparse git@github.com:UTAC99645/file.git
  cd file && git sparse-checkout set Web/utac/json
  ```
- `about.json`（Web/utac/json/）是 About 页成员数据源；头像可用
  `data:image/svg+xml` 内嵌，跟随 JSON 走不新增请求
- CDN 缓存：删除旧文件后旧 URL 可能仍 200（缓存残留），无引用即无害
