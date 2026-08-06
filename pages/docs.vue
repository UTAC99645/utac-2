<template>
  <!-- ========================================================== -->
  <!-- Doc 文档页
       作用：用大白话 + 图解讲清楚这个搜索站的「工作原理」，
             即使完全不懂代码也能看明白。
       结构：
         1. 整站原理图
         2. 核心搜索流程
         3. URL 分享原理
         4. 引擎配置原理
         5. QR 码生成原理
         6. 链接预览原理
         7. 一言原理
         8. 动手配置教程
         9. 安全与注意事项
  -->
  <!-- ========================================================== -->
  <div class="doc-page">
    <!-- ==================== 标题 ==================== -->
    <n-gradient-text class="doc-title" type="warning" :size="32">
      UTAC 搜索站 · 工作原理
    </n-gradient-text>
    <p class="doc-subtitle">这是一篇给小白看的说明书 —— 不用懂代码，看完就懂它怎么工作。</p>
    <n-divider />

    <!-- ==================== 1. 整站原理图 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">1. 整站一句话</h2>
      <p>
        你输入一句话，它挑一个<span class="doc-tag">搜索引擎</span>，拼出一条<span class="doc-tag">搜索链接</span>，
        然后打开。顺手还能帮你<span class="doc-tag">生成二维码</span>、<span class="doc-tag">预览文件</span>、
        <span class="doc-tag">显示一言</span>。所有引擎都写在两个 JSON 配置文件里，改文件就能加引擎。
      </p>

      <h2 class="doc-section-title">整站数据流</h2>
      <p>数据从哪里来、流到哪里去，一张图看懂：</p>
      <pre class="doc-diagram">   ┌──────────────── 数据源（两个 JSON 配置文件）────────────────┐
   │  addition/searchWay.json   主引擎表: google/bing/duckduckgo/Link │
   │  addition/searchKey.json   扩展项表: QR                          │
   └────────────────────────────┬───────────────────────────────────┘
                                │ 页面启动时读入
                                ▼
   ┌──────────────── 内存引擎表（JavaScript Map）──────────────────┐
   │  fullMap = 主引擎 + 扩展项（全量，驱动下拉框/前缀选择/激活态）   │
   │  keyMap  = 仅扩展项（驱动首页的快捷切换按钮）                    │
   │  每一条形如: google => { en: 是否激活, url: 搜索前缀, ... }      │
   └───────┬─────────────────┬──────────────────┬──────────────────┘
           │                 │                  │
   ┌───────▼────────┐ ┌──────▼───────┐  ┌───────▼───────────┐
   │ 搜索框 + 引擎下拉 │ │ 快捷切换按钮   │  │  QR码 / 链接预览 / 一言 │
   │  (index.vue)    │ │ (keyMap 驱动) │  │  (index.vue + Link)   │
   └────────────────┘ └──────────────┘  └─────────────────────┘
   <span class="cm">// 引擎配置改动后，以上界面会自动跟着变，无需改代码。</span></pre>
      <div class="doc-tip">
        <b>要点：</b>配置文件是「源头」，界面是「投影」。改源头，界面自动更新。
      </div>
    </n-card>

    <!-- ==================== 2. 核心搜索流程 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">2. 搜索是怎么发生的</h2>
      <p>一次完整搜索，就 4 步：</p>
      <div v-for="(s, i) in searchSteps" :key="i">
        <p style="display: flex; align-items: center">
          <span class="doc-step">{{ i + 1 }}</span>
          <span v-html="s"></span>
        </p>
      </div>

      <p>拼链接的本质，就是「前缀 + 你的话」：</p>
      <pre class="doc-diagram">  引擎前缀(url)          +  你输入的内容
  ─────────────────────────────────────────────
  "https://www.google.com/search?q="  +  "hello"
  "https://www.bing.com/search?q="    +  "hello"
  "https://duckduckgo.com/?q="        +  "hello"

  → 拼出来： https://www.google.com/search?q=hello
  → 用新标签页打开  ✅</pre>
      <div class="doc-tip">
        <b>特殊分支：</b>输入本身就是 http 链接 → 直接打开它；选了「Link」引擎 → 不搜索，进入内嵌预览。
      </div>
    </n-card>

    <!-- ==================== 3. URL 分享原理 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">3. 为什么链接能分享搜索状态</h2>
      <p>
        每次操作，页面都会把「当前状态」写进地址栏的 query 参数；
        别人打开这条链接，页面再把这些参数读回来、恢复状态。这就是双向同步。
      </p>
      <pre class="doc-diagram">  https://utac.top/?<span class="hl">type</span>=google&amp;<span class="hl">q</span>=hello&amp;<span class="hl">open</span>=true
                     │             │           │
                     │             │           └─ open=true : 打开后自动执行搜索
                     │             └───────────── q=hello   : 搜索词（自动填进输入框）
                     └─────────────────────────── type=google: 用哪个引擎</pre>
      <p><span class="doc-tag">type</span> 合法引擎有哪些，由 <code>searchEngineTypes</code> 这个「引擎名清单」判断；填了不存在的引擎，会提示并回退到默认的 <code>duckduckgo</code>。</p>
      <pre class="doc-diagram">  ┌──────────────────────── 双向同步 ────────────────────────┐
  │                                                          │
  │  你改输入框 / 换引擎  ─────►  写入 URL: ?type=&amp;q=&amp;open=      │
  │                                                          │
  │  别人打开带参数的 URL  ────►  读出参数，恢复引擎 + 搜索词      │
  │                                                          │
  └──────────────────────────────────────────────────────────┘</pre>
    </n-card>

    <!-- ==================== 4. 引擎配置原理 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">4. 引擎是怎么「配置」出来的</h2>
      <p>每个引擎是 JSON 里的一个二元组：<span class="doc-tag">[引擎名, 配置]</span>。</p>
      <pre class="doc-diagram">  // addition/searchWay.json
  [
    [ "google",     { "en": true,  "url": "https://www.google.com/search?q=" } ],
    [ "bing",       { "en": false, "url": "https://www.bing.com/search?q="   } ],
    [ "duckduckgo", { "en": false, "url": "https://duckduckgo.com/?q="       } ],
    [ "Link",       { "en": false, "url": "https://utac99645.top/?q=", "on": false } ]
  ]</pre>
      <table class="doc-fields">
        <thead>
          <tr><th>字段</th><th>含义</th><th>例子</th></tr>
        </thead>
        <tbody>
          <tr><td><code>en</code></td><td>是否为「当前激活」的引擎</td><td><code>true</code> 表示正在被选中</td></tr>
          <tr><td><code>url</code></td><td>搜索前缀，搜索时跟你的输入拼接</td><td><code>...search?q=</code></td></tr>
          <tr><td><code>on</code></td><td>（仅 Link）是否进入内嵌预览</td><td><code>true</code> 显示文件查看器</td></tr>
          <tr><td><code>icon</code></td><td>引擎图标（预留，暂未使用）</td><td>—</td></tr>
        </tbody>
      </table>
      <p>同一条 JSON 会同时驱动：下拉框选项、快捷按钮、激活态、QR 前缀拼接 —— 全由一个源头而来。</p>
    </n-card>

    <!-- ==================== 5. QR 码生成原理 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">5. 二维码是怎么生成的</h2>
      <p>二维码的内容 = 三段拼接，可以用开关控制每段：</p>
      <pre class="doc-diagram">  <span class="hl">extra(额外前缀)</span>   +   <span class="hl">主体 searchLC</span>    +   <span class="hl">extra_1(Link后缀)</span>
  "https://.../search?q="   +   "你要的内容"     +   "&amp;type=Link&amp;open=true"
         ↑                        ↑                        ↑
    开关 N 开启时           输入框内容 / 搜索词       前缀选 Link 且开关 O 开启时
    （拼上所选引擎前缀）                              （扫码打开直接进预览）</pre>
      <p>
        纠错等级有 <code>L / M / Q / H</code> 四档，纠错能力从低到高：
        越高越耐脏（局部被遮挡也能扫出来），但点阵更密、码更大。
      </p>
      <div class="doc-tip"><b>分享小技巧：</b>把「额外前缀」选成 Link 再开「O 开关」，扫出来的码会直接打开文件预览。</div>
    </n-card>

    <!-- ==================== 6. 链接预览原理 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">6. 万能文件查看器（Link）是怎么认文件的</h2>
      <p>它先靠 <b>URL 后缀</b>猜类型，猜不出的再靠<b>内容嗅探</b>，然后挑对应渲染器：</p>
      <pre class="doc-diagram">  传入 URL
     │
     ▼  ① 看扩展名
  .md → Markdown 渲染     .html → HTML 直接渲染
  .jpg/.png → 图片         .pdf → 沙盒 iframe
  .mp4 → 视频              .mp3 → 音频
  .js/.py/... → 代码高亮    .json → 折叠/展开
  .txt → 纯文本            无扩展名 → 当网页
     │
     ▼  ② 还认不出 → 抓内容嗅探（是不是 JSON / HTML）
     │
     ▼  ③ 都不像 → 提示「未知格式」，提供下载</pre>
      <p>预览组件 <code>components/Link.vue</code> 是异步加载的：用到了才下载，不影响首页首屏速度。</p>
    </n-card>

    <!-- ==================== 7. 一言原理 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">7. 一言是从哪来的</h2>
      <p>
        它调用公开接口 <code>https://v1.hitokoto.cn</code>，拿到一条句子显示在页面标题上。
        请求失败会自动重试，点「GET AOTHER」有 2 秒冷却防连点。
      </p>
      <pre class="doc-diagram">  点按钮 / 打开页面
     │
     ▼
  请求 v1.hitokoto.cn ──成功──► 拿到句子 → 替换标题/卡片 ✅
     │
     └──失败──► 等 2 秒 → 递归重试 🔁</pre>
      <div class="doc-tip"><b>降级：</b>网络不好拿不到也不影响别的功能，其余照常工作。</div>
    </n-card>

    <!-- ==================== 8. 动手配置教程 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">8. 动手改一改（教程）</h2>

      <p><b>① 新增一个搜索引擎</b></p>
      <ol>
        <li>打开 <code>addition/searchWay.json</code></li>
        <li>在数组里加一行 <code>[ "引擎名", { "en": false, "url": "前缀" } ]</code></li>
        <li>保存 → 下拉框和按钮里就会自动出现它</li>
      </ol>

      <p><b>② 换默认引擎（URL 出错时的回退）</b></p>
      <ol>
        <li>把 <code>searchWay.json</code> 里想让「URL 无 type 时」用的那条的 <code>en</code> 设为 <code>true</code></li>
        <li>其余引擎 <code>en</code> 设为 <code>false</code></li>
      </ol>

      <p><b>③ 调整二维码纠错等级</b></p>
      <p>在首页进入 QR 模式，点 <code>L / M / Q / H</code> 按钮即可实时切换。</p>

      <div class="doc-warn"><b>注意：</b>引擎名前缀必须是对应搜索站的真实地址（形如 <code>https://xxx/search?q=</code>），否则拼出来的链接打不开。</div>
    </n-card>

    <!-- ==================== 9. 安全与注意事项 ==================== -->
    <n-card class="doc-card" embedded :bordered="false" size="large">
      <h2 class="doc-section-title">9. 安全与注意事项</h2>
      <ul>
        <li><b>预览是「别人给的链接」：</b>Markdown / HTML 内容用 <code>v-html</code> 直接渲染、外部网页用沙盒 iframe，<b>别用它打开来路不明的文件</b>。</li>
        <li><b>部分资源走远程静态服务：</b>404 背景图、关于页数据来自外部地址，断网时相关页面会优雅降级，但主搜索功能不受影响。</li>
        <li><b>图标字段是预留的：</b><code>icon</code> 目前不生效，别指望它能显示引擎图标。</li>
      </ul>
    </n-card>

    <!-- ==================== 结尾 ==================== -->
    <n-divider />
    <p class="doc-subtitle">看完这篇，你就知道这个站的核心思路了 —— 配置驱动一切。</p>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// Doc 文档页脚本
// 纯静态展示页：仅组织页面内容，不含业务逻辑。
// searchSteps 用于「核心搜索流程」分步讲解的渲染数据。
// ============================================================

// ---------- 页面样式 ----------
import "../assets/css/docs.css";

// ---------- 核心搜索流程分步文案（支持内联 HTML 高亮） ----------
const searchSteps: string[] = [
  `在<code>下拉框</code>选一个引擎（或点快捷按钮）`,
  `在<code>输入框</code>里输入搜索词`,
  `点搜索，页面把<code>引擎前缀 + 搜索词</code>拼成完整链接`,
  `<code>新标签页</code>打开链接，完成搜索`
];
</script>
