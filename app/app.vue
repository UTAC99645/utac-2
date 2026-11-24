<!-- app.vue -->
<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-message-provider>
        <!-- ---------- 顶部悬浮玻璃导航 ---------- -->
        <nav class="site-nav" :class="{ 'is-scrolled': navScrolled }">
          <span class="nav-brand" @click="router.push('/')">UTAC</span>
          <n-breadcrumb separator="<->">
            <n-breadcrumb-item v-for="item in way" :key="item.path" @click="router.push(item.path)">
              <n-text :type="route.name === item.name ? 'info' : 'default'">
                {{ item.name }}
              </n-text>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </nav>

        <!-- ---------- 路由视图 ---------- -->
        <n-flex justify="center">
          <NuxtLayout>
            <NuxtPage />
          </NuxtLayout>
        </n-flex>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
const route = useRoute()

// ============================================================
// 根组件脚本（全局应用壳）
// 职责：
//   1. 提供全局 naive-ui 主题（深色模式）
//   2. 提供加载条、消息提示等全局 UI 能力
//   3. 顶部悬浮玻璃导航 + 下方路由视图
// ============================================================
import "./assets/css/router.css";

// ---------- 导航滚动加深：滚过一屏 1/6 后挂 is-scrolled ----------
const navScrolled = ref(false);

function onNavScroll(): void {
  navScrolled.value = window.scrollY > 90;
}

onMounted(() => {
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();
  startTrail();
  // 首屏资源预加载：背景 WebP + 字体子集尽早开始下载
  useHead({
    link: [
      { rel: "preload", as: "image", href: "/assets/img/143937772_p2.webp", fetchpriority: "high" },
      { rel: "preload", as: "font", type: "font/woff2", href: "/assets/font/MapleMono-sub.woff2", crossorigin: "" }
    ]
  });
  useSeoMeta({
    title: () => (route.meta.title as string) || "UTAC's Search comb",
    description: () => (route.meta.description as string) || "UTAC's Search comb",
    ogTitle: () => (route.meta.title as string) || "UTAC's Search comb",
    ogDescription: () => (route.meta.description as string) || "UTAC's Search comb",
    ogImage: 'https://file.utac.top/BackGround/E/Evil-push!.jpg',
    ogUrl: () => `https://utac.top${route.fullPath}`,
  })
});

// 全站指针轨迹特效（桌面鼠标拖尾 / 手机触摸涟漪）
const { start: startTrail } = usePointerTrail();

onUnmounted(() => {
  window.removeEventListener("scroll", onNavScroll);
});

// ---------- naive-ui ----------
import { darkTheme } from "naive-ui";

// ---------- Vue Router ----------
import { useRoute, useRouter } from "vue-router";

// ============================================================
// 面包屑导航数据
// way 中的 name 同时是路由名：与当前路由名一致时高亮显示
// ============================================================

const router = useRouter();

const way = ref<{ name: string; path: string }[]>([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Docs", path: "/docs" },
  { name: "Statistics", path: "/statistics" }
]);
</script>
