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
    <n-message-provider>
      <n-loading-bar-provider>

        <!-- ---------- 面包屑导航 ---------- -->
        <n-flex justify="end">
          <n-breadcrumb separator="<->">
            <n-breadcrumb-item v-for="item in way" :key="item.path" @click="router.push(item.path)">
              <n-text :type="route.name === item.name ? 'info' : 'default'">
                {{ item.name }}
              </n-text>
            </n-breadcrumb-item>
            <n-breadcrumb-item>
              <n-text type="warn" @click="bgrdm">
                Get A N BG
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

      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
// ============================================================
// 根组件脚本
// ============================================================

// ---------- naive-ui ----------
import { darkTheme } from 'naive-ui';

// ---------- Vue Router ----------
import { useRoute, useRouter } from 'vue-router';

import BGsrc from "./addition/Bg.way.json";
import { onMounted, watch } from 'vue';

// ============================================================
// 导航数据
// ============================================================

const route = useRoute();
const router = useRouter();

const way = ref([
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]);
const BG = new Map(BGsrc)
const BGU = computed(() => {
  return BG.get(BGUN.value).url
})
const BGUN = ref("140342092_p0.jpg")

onMounted(bgrdm)
watch(BGUN, () => {
  let N = `url("${BGU.value}")`
  console.log(N)
  document.documentElement.style.setProperty('--background-url', N);
},
  { immediate: true })

function bgrdm() {
  let key = Array.from(BG.keys())
  let num = BG.size
  let R = 0
  R = Math.floor(Math.random() * num)
  BGUN.value = key[R]
}

</script>

<style scoped>
/* 根组件暂无局部样式 */
</style>
