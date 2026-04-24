<template>
  <!-- ========================================================== -->
  <!-- 根组件（App Shell）
       职责：
       1. 提供全局 naive-ui 主题（深色模式）
       2. 提供加载条、消息提示等全局 UI 能力
       3. 顶部面包屑导航 + 下方路由视图
  -->
  <!-- ========================================================== -->
  <n-config-provider :theme="darkTheme">
    <n-loading-bar-provider>
      <n-message-provider>

        <!-- ---------- 面包屑导航 ---------- -->
        <n-flex justify="end">
          <n-breadcrumb separator="<->">
            <n-breadcrumb-item
              v-for="item in way"
              :key="item.path"
              @click="router.push(item.path)"
            >
              <n-text :type="route.path === item.path ? 'info' : 'default'">
                {{ item.name }}
              </n-text>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </n-flex>

        <!-- ---------- 分隔线 ---------- -->
        <n-divider />

        <!-- ---------- 路由视图 ---------- -->
        <n-flex justify="center">
          <router-view />
        </n-flex>

      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
// ---------- naive-ui ----------
import { darkTheme } from 'naive-ui';

// ---------- Vue Router ----------
import { useRoute, useRouter } from 'vue-router';

// ============================================================
// 导航数据
// ============================================================

const route  = useRoute();
const router = useRouter();

const way = ref([
  { name: 'Home',  path: '/'       },
  { name: 'About', path: '/about'  }
]);
</script>

<style scoped>
/* 根组件暂无局部样式 */
</style>
