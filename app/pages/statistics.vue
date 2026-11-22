<template>
  <!-- ========================================================== -->
  <!-- 统计页面
       展示：搜索引擎配置概览 + 页面访问统计
       风格：与全站一致的深色毛玻璃主题（复用 main.css 设计令牌）
  -->
  <!-- ========================================================== -->
  <div class="statistics-page">
    <!-- ---------- 顶部标题区 ---------- -->
    <header class="stats-hero">
      <h1 class="stats-title">统计概览</h1>
      <p class="stats-subtitle">UTAC-2 · 搜索引擎与访问数据一览</p>
    </header>

    <!-- ---------- 概览数字横条 ---------- -->
    <section class="stats-summary">
      <div class="summary-item" v-for="item in summary" :key="item.label">
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-label">{{ item.label }}</div>
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
          v-for="(engine, i) in engineList"
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

    <!-- ---------- 页面访问统计 ---------- -->
    <section class="stats-section">
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
// ============================================================

// ---------- 搜索引擎配置 ----------
const engineList = [
  { key: "google", label: "Google", desc: "google.com/search", url: "https://www.google.com/search?q=", color: "linear-gradient(135deg, #4285f4, #34a853)" },
  { key: "bing", label: "Bing", desc: "bing.com/search", url: "https://bing.com/search?q=", color: "linear-gradient(135deg, #00a1f1, #008373)" },
  { key: "duckduckgo", label: "DuckDuckGo", desc: "duckduckgo.com", url: "https://duckduckgo.com/?q=", color: "linear-gradient(135deg, #de5833, #ffb92e)" },
  { key: "Link", label: "Link", desc: "utac99645.top", url: "https://utac99645.top/?q=", color: "linear-gradient(135deg, #7b8ed8, #6366f1)" }
];

// ---------- 页面访问统计 ----------
const pageStats = [
  { route: "/", visits: 1247, lastVisit: "2026-11-19" },
  { route: "/about", visits: 382, lastVisit: "2026-11-18" },
  { route: "/link", visits: 156, lastVisit: "2026-11-17" }
];

// ---------- 概览数字 ----------
const totalVisits = pageStats.reduce((sum, p) => sum + p.visits, 0);
const summary = computed(() => [
  { label: "搜索引擎", value: engineList.length },
  { label: "统计页面", value: pageStats.length },
  { label: "总访问量", value: totalVisits.toLocaleString() }
]);

// ---------- 访问量条形宽度（按最大值归一为百分比） ----------
const maxVisits = Math.max(...pageStats.map((p) => p.visits), 1);
function barWidth(v: number): number {
  return Math.round((v / maxVisits) * 100);
}
</script>

<style scoped>
/* ============================================================
   统计页样式（复用 main.css 设计令牌，深色毛玻璃风格）
   ============================================================ */

.statistics-page {
  width: min(88vw, 960px);
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md) var(--space-xl);
  min-width: 0;
}

/* ---------- 顶部标题 ---------- */
.stats-hero {
  text-align: center;
  margin: var(--space-lg) 0 var(--space-xl);
  animation: fadeIn 0.7s var(--ease-out) both;
}

.stats-title {
  font-size: 2.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  margin: 0;
  background: linear-gradient(120deg, #a8b8ff 0%, #7b8ed8 45%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 12px rgba(123, 142, 216, 0.45));
}

.stats-subtitle {
  margin-top: var(--space-sm);
  color: var(--text-muted);
  font-size: var(--fs-sm);
  letter-spacing: 0.1em;
}

/* ---------- 概览数字横条 ---------- */
.stats-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  animation: fadeIn 0.8s var(--ease-out) both;
}

.summary-item {
  position: relative;
  text-align: center;
  padding: var(--space-lg) var(--space-sm);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}

.summary-item::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(123, 142, 216, 0.18), transparent 70%);
  pointer-events: none;
}

.summary-item:hover {
  transform: translateY(-4px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.summary-value {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(120deg, #ffffff, #a8b8ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.summary-label {
  margin-top: var(--space-xs);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  letter-spacing: 0.08em;
}

/* ---------- 区块标题 ---------- */
.stats-section {
  margin-bottom: var(--space-xl);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--fs-lg);
  font-weight: 600;
  margin: 0 0 var(--space-lg);
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.heading-bar {
  display: inline-block;
  width: 4px;
  height: 1.1em;
  border-radius: var(--radius-sm);
  background: linear-gradient(180deg, #7b8ed8, #6366f1);
  box-shadow: 0 0 10px rgba(123, 142, 216, 0.6);
}

/* ---------- 搜索引擎卡片网格 ---------- */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-md);
}

.stat-card {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--shadow-sm);
  opacity: 0;
  animation: cardIn 0.55s var(--ease-out) forwards;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-head {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.engine-badge {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  box-shadow: var(--shadow-sm);
}

.engine-meta {
  min-width: 0;
}

.engine-name {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.engine-key {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  opacity: 0.75;
}

.engine-url {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-top: var(--space-md);
  font-size: var(--fs-sm);
  color: var(--text-muted);
  word-break: break-all;
}

.url-dot {
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

/* ---------- 页面访问列表 ---------- */
.visit-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.visit-row {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--shadow-sm);
  opacity: 0;
  animation: cardIn 0.55s var(--ease-out) forwards;
  transition: border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
}

.visit-row:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.visit-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
}

.visit-route {
  font-family: var(--font-mono);
  font-size: var(--fs-md);
  font-weight: 600;
  color: #a8b8ff;
}

.visit-count {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.visit-bar {
  position: relative;
  height: 8px;
  margin: var(--space-sm) 0 var(--space-xs);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.visit-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #7b8ed8, #6366f1);
  box-shadow: 0 0 12px rgba(123, 142, 216, 0.6);
  transition: width 0.9s var(--ease-out);
}

.visit-date {
  font-size: var(--fs-sm);
  color: var(--text-muted);
  opacity: 0.8;
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .statistics-page {
    width: 92vw;
    padding-inline: 0;
  }

  .stats-title {
    font-size: 2rem;
  }

  .stats-summary {
    gap: var(--space-sm);
  }

  .summary-item {
    padding: var(--space-md) var(--space-xs);
  }

  .summary-value {
    font-size: 1.6rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  /* 概览数字：手机上仍保持三列并排，仅缩小字号/内距，避免竖排占满屏幕 */
  .summary-item {
    padding: var(--space-md) 2px;
  }

  .summary-value {
    font-size: 1.35rem;
  }

  .summary-label {
    font-size: 11px;
    letter-spacing: 0;
  }
}

/* ---------- 触屏：关闭 hover 抬升 ---------- */
@media (hover: none) and (pointer: coarse) {
  .summary-item:hover,
  .stat-card:hover,
  .visit-row:hover {
    transform: none;
  }
}

/* ---------- 减少动效 ---------- */
@media (prefers-reduced-motion: reduce) {
  .stats-hero,
  .stats-summary,
  .stat-card,
  .visit-row {
    animation: none !important;
    opacity: 1 !important;
  }
  .visit-bar-fill {
    transition: none !important;
  }
}
</style>
