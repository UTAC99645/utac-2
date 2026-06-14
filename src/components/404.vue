<template>
  <!-- ========================================================== -->
  <!-- 404 页面
       视觉元素：
       1. 全屏背景图 + 缓慢缩放动画
       2. 飘落粒子装饰
       3. 毛玻璃卡片（含故障艺术字 404）
       4. 猫爪印装饰
  -->
  <!-- ========================================================== -->
  <div class="not-found-page">

    <!-- 背景图 -->
    <div class="bg-image" :style="{ backgroundImage: `url(${bgUrl})` }" />

    <!-- 粒子装饰 -->
    <div class="particles">
      <span v-for="n in 20" :key="n" class="particle" :style="getParticleStyle(n)" />
    </div>

    <!-- 毛玻璃卡片 -->
    <div class="glass-card" :class="{ 'card-enter': mounted }">
      <div class="glitch-wrapper">
        <h1 class="glitch" data-text="404">404</h1>
      </div>

      <p class="subtitle">页面走丢啦 ~(=^‥^)/</p>
      <p class="desc">
        主人要找的页面好像被本喵藏起来了喵…<br>
        要不要回到首页继续探险呢？<br>
        <b><s><i>{{ route.params.pathMatch }}</i></s></b>
      </p>

      <div class="actions">
        <button class="btn-primary" @click="goHome">
          <span class="btn-icon">🏠</span>
          返回首页
        </button>
        <button class="btn-secondary" @click="goBack">
          <span class="btn-icon">↩</span>
          返回上一页
        </button>
      </div>

      <!-- 装饰猫猫爪印 -->
      <div class="paw-prints">
        <span v-for="i in 3" :key="i" class="paw">🐾</span>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="footer">
      <span>© {{ new Date().getFullYear() }} UTAC</span>
    </div>
  </div>
</template>

<script setup>
// ============================================================
// 404 页面脚本
// 功能：
//   1. 全屏背景图 + 飘落粒子动画
//   2. 毛玻璃卡片（含故障艺术字 404）
//   3. 返回首页 / 返回上一页
// ============================================================

import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import '../css/404.css';

// ---------- Router ----------
const route = useRoute();
const router = useRouter();

// ---------- 状态 ----------
const mounted = ref(false);

// ---------- 背景图地址 ----------
const bgUrl = 'https://file.utac99645.top/BackGround/143937772_p2.png';

// ============================================================
// 生命周期
// ============================================================

onMounted(() => {
  // 触发卡片入场动画
  setTimeout(() => {
    mounted.value = true;
  }, 100);
});

// ============================================================
// 导航方法
// ============================================================

const goHome = () => router.push('/');

const goBack = () => router.back();

// ============================================================
// 粒子样式生成（随机大小、位置、延迟）
// ============================================================

const getParticleStyle = (n) => {
  const size = Math.random() * 4 + 2;
  const left = Math.random() * 100;
  const delay = Math.random() * 5;
  const duration = Math.random() * 10 + 10;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: Math.random() * 0.5 + 0.2
  };
};
</script>
