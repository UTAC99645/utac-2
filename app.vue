<!-- app.vue -->
<template>
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-message-provider>
        <!-- ---------- 面包屑导航 ---------- -->
        <n-flex justify="end">
          <n-breadcrumb separator="<->">
            <n-breadcrumb-item v-for="item in way" :key="item.path" @click="router.push(item.path)">
              <n-text :type="route.name === item.name ? 'info' : 'default'">
                {{ item.name }}
              </n-text>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </n-flex>

        <!-- ---------- 分隔线 ---------- -->
        <n-divider />

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
// ============================================================
// 根组件脚本（全局应用壳）
// 职责：
//   1. 提供全局 naive-ui 主题（深色模式）
//   2. 提供加载条、消息提示等全局 UI 能力
//   3. 顶部面包屑导航 + 下方路由视图
// ============================================================
import "./assets/css/router.css";

// ---------- naive-ui ----------
import { darkTheme } from "naive-ui";

// ---------- Vue Router ----------
import { useRoute, useRouter } from "vue-router";

// ============================================================
// 面包屑导航数据
// way 中的 name 同时是路由名：与当前路由名一致时高亮显示
// ============================================================

const route = useRoute();
const router = useRouter();

const way = ref<{ name: string; path: string }[]>([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Docs", path: "/docs" }
]);
</script>
