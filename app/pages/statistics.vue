<template>
  <!-- ========================================================== -->
  <!-- 统计页面
       展示：搜索引擎配置概览 + 站点真实访问统计
       数据来源：
         - 引擎卡片来自 composables/useEngines.ts（与首页同源）
         - 访问数据来自 /api/stats（Pages Function 代理 Cloudflare
           GraphQL Analytics，只读 Token 存服务端环境变量）
       降级：/api/stats 不可用时回退演示数据并标注"示例数据"
  -->
  <!-- ========================================================== -->
  <div class="statistics-page">
    <!-- ---------- 顶部标题区 ---------- -->
    <header class="stats-hero">
      <h1 class="stats-title">统计概览</h1>
      <p class="stats-subtitle">
        UTAC-2 · 搜索引擎与访问数据一览
        <n-tag v-if="dataSource === 'live'" type="success" size="small" round>真实数据 · 近 30 天</n-tag>
        <n-tag v-else-if="dataSource === 'fallback'" type="warning" size="small" round>示例数据</n-tag>
      </p>
    </header>

    <!-- ---------- 概览数字横条 ---------- -->
    <section class="stats-summary">
      <div class="summary-item" v-for="item in summary" :key="item.label">
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-label">{{ item.label }}</div>
      </div>
    </section>

    <!-- ---------- 访问趋势（近 30 天柱状图，真实数据时显示） ---------- -->
    <section v-if="dataSource === 'live'" class="stats-section">
      <h2 class="section-heading">
        <span class="heading-bar"></span>访问趋势
      </h2>

      <div class="chart-card">
        <div class="chart-bars">
          <div
            v-for="d in daily"
            :key="d.date"
            class="chart-col"
            :title="`${d.date} · ${d.pageViews} PV / ${d.uniques} UV`"
          >
            <div class="chart-bar" :style="{ height: barHeight(d) + '%' }"></div>
          </div>
        </div>
        <div class="chart-axis">
          <span>{{ daily[0]?.date }}</span>
          <span>{{ daily[daily.length - 1]?.date }}</span>
        </div>
      </div>
    </section>

    <!-- ---------- 搜索引擎卡片 ---------- -->
    <section class="stats-section">
      <h2 class="section-heading">
        <span class="heading-bar"></span>搜索引擎
      </h2>

      <div class="stats-grid">
        <article
          class="stat-card"
          v-for="(engine, i) in engineCards"
          :key="engine.key"
          :style="{ animationDelay: i * 60 + 'ms' }"
        >
          <div class="card-head">
            <span class="engine-badge" :style="{ background: engine.color }">
              {{ engine.label.charAt(0) }}
            </span>
            <div class="engine-meta">
              <div class="engine-name">{{ engine.label }}</div>
              <div class="engine-key">{{ engine.key }}</div>
            </div>
          </div>

          <div class="engine-url" :title="engine.url">
            <span class="url-dot"></span>{{ engine.desc }}
          </div>
        </article>
      </div>
    </section>

    <!-- ---------- 热门路径（真实数据且有路径统计时显示） ---------- -->
    <section v-if="dataSource === 'live' && routes.length" class="stats-section">
      <h2 class="section-heading">
        <span class="heading-bar"></span>热门路径
      </h2>

      <div class="visit-list">
        <div
          class="visit-row"
          v-for="(route, i) in routes"
          :key="route.path"
          :style="{ animationDelay: i * 60 + 'ms' }"
        >
          <div class="visit-top">
            <span class="visit-route">{{ route.path }}</span>
            <span class="visit-count">{{ route.visits.toLocaleString() }} 次访问</span>
          </div>
          <div class="visit-bar">
            <div
              class="visit-bar-fill"
              :style="{ width: routeBarWidth(route.visits) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- 页面访问（回退演示数据时显示） ---------- -->
    <section v-else-if="dataSource !== 'live'" class="stats-section">
      <h2 class="section-heading">
        <span class="heading-bar"></span>页面访问
      </h2>

      <div class="visit-list">
        <div
          class="visit-row"
          v-for="(page, i) in pageStats"
          :key="page.route"
          :style="{ animationDelay: i * 80 + 'ms' }"
        >
          <div class="visit-top">
            <span class="visit-route">{{ page.route }}</span>
            <span class="visit-count">{{ page.visits.toLocaleString() }} 次</span>
          </div>
          <div class="visit-bar">
            <div
              class="visit-bar-fill"
              :style="{ width: barWidth(page.visits) + '%' }"
            ></div>
          </div>
          <div class="visit-date">最后访问：{{ page.lastVisit }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 统计页面脚本
// 引擎卡片由 useEngines 状态仓派生（颜色为展示层本地映射）；
// 访问数据由 /api/stats 提供（Cloudflare Analytics 真实数据），
// 接口不可用时回退内置演示数据并打上"示例数据"标签
// ============================================================

import '../assets/css/statistics.css'

/** 引擎徽章配色（仅展示用；未登记的引擎走默认色） */
const ENGINE_COLORS: Record<string, string> = {
  google: "linear-gradient(135deg, #4285f4, #34a853)",
  bing: "linear-gradient(135deg, #00a1f1, #008373)",
  duckduckgo: "linear-gradient(135deg, #de5833, #ffb92e)",
  Link: "linear-gradient(135deg, #7b8ed8, #6366f1)"
};
/** 未登记引擎的默认徽章色 */
const FALLBACK_COLOR = "linear-gradient(135deg, #7b8ed8, #6366f1)";

/** 主机名展示优化：去掉协议与查询参数 */
function hostDesc(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
}

const engines = useEngines();

/** 引擎卡片视图模型 */
const engineCards = computed(() =>
  engines.entries.value.map(([key]) => ({
    key,
    label: key,
    desc: hostDesc(engines.urlOf(key)) || "自定义前缀",
    url: engines.urlOf(key),
    color: ENGINE_COLORS[key] ?? FALLBACK_COLOR
  }))
);

// ============================================================
// 真实访问数据（/api/stats）
// ============================================================

interface StatsDay {
  date: string;
  requests: number;
  pageViews: number;
  uniques: number;
}
interface StatsRoute {
  path: string;
  visits: number;
}
interface StatsPayload {
  ok: boolean;
  range?: { since: string; until: string; days: number };
  totals?: { requests: number; pageViews: number; uniques: number };
  days?: StatsDay[];
  routes?: StatsRoute[];
  error?: string;
}

/** live=真实数据 / fallback=演示数据 */
const dataSource = ref<"loading" | "live" | "fallback">("loading");
const daily = ref<StatsDay[]>([]);
const routes = ref<StatsRoute[]>([]);
const totals = ref({ requests: 0, pageViews: 0, uniques: 0 });

/** 回退演示数据（/api/stats 不可用时展示） */
const pageStats = [
  { route: "/", visits: 1247, lastVisit: "2026-11-19" },
  { route: "/about", visits: 382, lastVisit: "2026-11-18" },
  { route: "/link", visits: 156, lastVisit: "2026-11-17" }
];

onMounted(async () => {
  try {
    const res = await fetch("/api/stats");
    const data = (await res.json()) as StatsPayload;
    if (res.ok && data.ok && data.days?.length) {
      daily.value = data.days;
      routes.value = data.routes ?? [];
      totals.value = data.totals ?? totals.value;
      dataSource.value = "live";
      return;
    }
  } catch {
    // 网络失败走回退
  }
  dataSource.value = "fallback";
});

/** 趋势柱高（按最大 PV 归一，最低给 4% 保证可见） */
function barHeight(d: StatsDay): number {
  const max = Math.max(...daily.value.map((x) => x.pageViews), 1);
  return Math.max(4, Math.round((d.pageViews / max) * 100));
}

/** 演示数据条宽（按最大值归一） */
function barWidth(v: number): number {
  const max = Math.max(...pageStats.map((p) => p.visits), 1);
  return Math.round((v / max) * 100);
}

/** 热门路径条宽 */
function routeBarWidth(v: number): number {
  const max = Math.max(...routes.value.map((r) => r.visits), 1);
  return Math.max(3, Math.round((v / max) * 100));
}

// ---------- 概览数字 ----------
const summary = computed(() => [
  { label: "搜索引擎", value: engineCards.value.length },
  {
    label: dataSource.value === "live" ? "总浏览量 (30d)" : "统计页面",
    value:
      dataSource.value === "live"
        ? totals.value.pageViews.toLocaleString()
        : pageStats.length
  },
  {
    label: dataSource.value === "live" ? "独立访客 (30d)" : "总访问量",
    value:
      dataSource.value === "live"
        ? totals.value.uniques.toLocaleString()
        : pageStats.reduce((sum, p) => sum + p.visits, 0).toLocaleString()
  }
]);
</script>
