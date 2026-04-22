<template>
  <!-- 根组件模板 -->
  <!-- 使用 naive-ui 的深色主题配置 -->
  <n-config-provider :theme="darkTheme">
    <!-- 加载条提供者 -->
    <n-loading-bar-provider>
      <!-- 消息提示提供者 -->
      <n-message-provider>
        <!-- 面包屑导航区域，右对齐 -->
        <n-flex justify="end">
          <n-breadcrumb separator="<->">
            <!-- 遍历路由路径生成面包屑项 -->
            <n-breadcrumb-item v-for="item in way" :key="item.path" @click="router.push(item.path)">
              <!-- 当前路由高亮显示 -->
              <n-text :type="route.path === item.path ? 'info' : 'default'">
                {{ item.name }}
              </n-text>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </n-flex>
        <!-- 分隔线 -->
        <n-divider />
        <!-- 路由视图区域，居中对齐 -->
        <n-flex justify="center">
          <router-view />
        </n-flex>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
// 引入 naive-ui 深色主题
import { darkTheme } from 'naive-ui';
// 引入 Vue Router 的组合式 API
import { useRoute, useRouter } from 'vue-router';

// 获取当前路由信息
const route = useRoute()
// 获取路由操作实例
const router = useRouter()
// 定义导航路径数据
const way = ref([
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' }
])
</script>

<!-- 组件局部样式 -->
<style scoped></style>
