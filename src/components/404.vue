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
        要不要回到首页继续探险呢？
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
import { useRouter } from 'vue-router';

// ---------- Router ----------
const router = useRouter();

// ---------- 状态 ----------
const mounted = ref(false);

// ---------- 背景图地址 ----------
const bgUrl = 'https://file.utac99645.top/BackGround/140342092_p0.jpg';

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
  const size     = Math.random() * 4 + 2;
  const left     = Math.random() * 100;
  const delay    = Math.random() * 5;
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

<style scoped>
/* ==================== 页面容器 ==================== */
.not-found-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Maple Mono NF', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==================== 背景图 ==================== */
.bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.1);
  animation: bgZoom 20s ease-in-out infinite alternate;
  z-index: 0;
}

@keyframes bgZoom {
  0%   { transform: scale(1.1); }
  100% { transform: scale(1.2); }
}

/* 暗色遮罩增强文字可读性 */
.bg-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

/* ==================== 粒子 ==================== */
.particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: -10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: fall linear infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}

@keyframes fall {
  0%   { transform: translateY(-10px) rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* ==================== 毛玻璃卡片 ==================== */
.glass-card {
  position: relative;
  z-index: 2;
  padding: 3rem 3.5rem;
  border-radius: 24px;
  text-align: center;
  max-width: 480px;
  width: 90%;

  /* 核心毛玻璃效果 */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 边框高光 */
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);

  /* 入场动画 */
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-enter {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 内发光边框效果 */
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1.5px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    rgba(255, 255, 255, 0) 50%,
    rgba(255, 255, 255, 0.4) 100%
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ==================== 404 故障艺术字 ==================== */
.glitch-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.glitch {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  color: #fff;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.3),
    0 0 80px rgba(144, 238, 144, 0.2);
  position: relative;
  letter-spacing: -2px;
  animation: glitch-skew 3s infinite linear alternate-reverse;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 #39ff14;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim 5s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 #ff00ff;
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-anim2 5s infinite linear alternate-reverse;
}

@keyframes glitch-anim {
  0%   { clip: rect(30px, 9999px, 10px, 0); }
  20%  { clip: rect(80px, 9999px, 90px, 0); }
  40%  { clip: rect(10px, 9999px, 50px, 0); }
  60%  { clip: rect(60px, 9999px, 20px, 0); }
  80%  { clip: rect(40px, 9999px, 70px, 0); }
  100% { clip: rect(90px, 9999px, 30px, 0); }
}

@keyframes glitch-anim2 {
  0%   { clip: rect(60px, 9999px, 40px, 0); }
  20%  { clip: rect(20px, 9999px, 80px, 0); }
  40%  { clip: rect(70px, 9999px, 10px, 0); }
  60%  { clip: rect(10px, 9999px, 60px, 0); }
  80%  { clip: rect(50px, 9999px, 30px, 0); }
  100% { clip: rect(30px, 9999px, 90px, 0); }
}

@keyframes glitch-skew {
  0%   { transform: skew(0deg); }
  10%  { transform: skew(-2deg); }
  20%  { transform: skew(2deg); }
  30%  { transform: skew(0deg); }
  100% { transform: skew(0deg); }
}

/* ==================== 文字样式 ==================== */
.subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.75rem;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.8;
  margin-bottom: 2rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* ==================== 按钮 ==================== */
.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #39ff14 0%, #2ecc71 100%);
  color: #000;
  box-shadow: 0 4px 20px rgba(57, 255, 20, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(57, 255, 20, 0.45);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1rem;
}

/* ==================== 猫爪印装饰 ==================== */
.paw-prints {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0.6;
}

.paw {
  font-size: 1.2rem;
  animation: pawBounce 2s ease-in-out infinite;
}

.paw:nth-child(2) { animation-delay: 0.3s; }
.paw:nth-child(3) { animation-delay: 0.6s; }

@keyframes pawBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}

/* ==================== 底部 ==================== */
.footer {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
  .glass-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .glitch {
    font-size: 5rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

/* ==================== 减少动画偏好 ==================== */
@media (prefers-reduced-motion: reduce) {
  .bg-image,
  .glitch,
  .glitch::before,
  .glitch::after,
  .particle,
  .paw {
    animation: none !important;
  }

  .glass-card {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
</style>
