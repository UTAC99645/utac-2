# 性能手册（PERFORMANCE）

> 目标：首屏载荷 ~2.3MB（2026-11-24 优化前 ~28MB）。改资源前先读这份，别把山搬回来。

## 现状预算

| 资源 | 大小 | 说明 |
| --- | --- | --- |
| 背景图 `143937772_p2.webp` | 789KB | cwebp -q 82；`app.vue` preload（fetchpriority=high） |
| 字体 `MapleMono-sub.woff2` | 1.5MB | pyftsubset 子集，自托管 |
| JS/CSS（entry + pages） | ~20KB 级 | Vite 打包，CSS 不压缩（nuxt.config 显式 cssMinify:false） |
| 启动屏 | 0KB | 纯 CSS（boot-screen），SSR 直出 |
| 一言 / QR | 按需 | FileViewer（marked + highlight.js）defineAsyncComponent，首屏不拉 |

**红线**：新增静态图片 >300KB 必须先转 WebP；禁止任何形式的外链整包字体。

## 优化手法档案（已落地）

### 1. 背景图 WebP（8.6MB → 789KB，-91%）

```bash
cwebp -q 82 143937772_p2.png -o 143937772_p2.webp
```

- 全站背景在 `main.css` body 上引用；404 页（`[...slug].vue`）同样用本地 WebP
  （原为外链 PNG，跨域大图拖慢 404 页）

### 2. 字体子集化（19.5MB → 1.5MB，-92%）

```bash
# 工具：apk add py3-fonttools py3-brotli
# 字符清单：ASCII + 常用中文标点 + GB2312 全汉字 + 假名 + 页面源码字符
pyftsubset maple.ttf --unicodes-file=unicodes.txt \
  --flavor=woff2 --output-file=MapleMono-sub.woff2 \
  --layout-features='*' --no-hinting
# 校验无缺字：
python3 -c "from fontTools.ttLib import TTFont; \
  f=TTFont('MapleMono-sub.woff2'); cmap=f.getBestCmap(); \
  miss=[c for c in '搜索引擎统计喵' if ord(c) not in cmap]; print(miss or 'OK')"
```

- `@font-face` 在 `main.css`，`font-display: swap`，`local()` 优先
- 新增文案用到生僻字时：重新生成子集（源 TTF 在 file.utac.top/font/）

### 3. 启动屏（替代 1ms 假加载 GIF，-1MB + 首屏感知更快）

- 旧：随机 1MB GIF 只闪现 1ms（`v-if="spinShow"`），纯浪费还掩盖 SSR 问题
- 新：`index.vue` 的 `booting/bootOut` 状态 + `home.css` 的 `.boot-screen`
  （品牌渐变字 + 流光进度条，750ms 播放 + 280ms 淡出）
- 附带效应：SSR 直出启动屏（主内容 ClientOnly），首字节 HTML 极小

### 4. 预加载

`app.vue` onMounted 里 useHead 注入：

- 背景 WebP：`<link rel="preload" as="image" fetchpriority="high">`
- 字体：`<link rel="preload" as="font" type="font/woff2" crossorigin="">`
- **不能**写在 `nuxt.config.ts` 的 `app.head`（本 nightly 会 SSR 500）

## 验证方法

```bash
# 静态资源体积
ls -la public/assets/img/*.webp public/assets/font/*.woff2

# 本地冒烟 + 资源抽查
node .output/server/index.mjs &
curl -s -o /dev/null -w '%{http_code} %{size_download}B\n' http://localhost:3000/assets/img/143937772_p2.webp
curl -s -o /dev/null -w '%{http_code} %{size_download}B\n' http://localhost:3000/assets/font/MapleMono-sub.woff2
curl -s http://localhost:3000/ | rg -c 'boot-screen'   # 启动屏已 SSR
```

浏览器侧：DevTools Network 看首屏载荷；截图验收注意无头浏览器三大假象
（见 AGENTS.md「测试策略」）。

## 历史坑位

- 旧静态文件删除后 Cloudflare CDN 仍可能 200（缓存残留）；无引用即无害，新部署不清旧缓存
- 构建被 signal 打断 → `.output` 撕裂，server `MODULE_NOT_FOUND`，完整重建即可
- 改 `functions/api` 或 Pages 环境变量后必须新部署才生效
