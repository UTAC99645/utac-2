<template>
  <!-- ========================================================== -->
  <!-- 全局错误页（Nuxt 约定：app/error.vue）
       任何未捕获错误 / 页面级异常都会落到这里
       视觉：与 404 页同款深色毛玻璃卡片风格
  -->
  <!-- ========================================================== -->
  <div class="not-found-page">
    <!-- 毛玻璃卡片 -->
    <div class="glass-card card-enter">
      <div class="glitch-wrapper">
        <h1 class="glitch" data-text="OOPS">OOPS</h1>
      </div>

      <p class="subtitle">出错了呢 ~(=^‥^)/</p>
      <p class="desc">
        页面遇到了意外状况喵…<br />
        <b><i>{{ error?.message || '未知错误' }}</i></b>
      </p>

      <div class="actions">
        <button class="btn-primary" @click="handleRecover">
          <span class="btn-icon">🏠</span>
          返回首页
        </button>
        <button class="btn-secondary" @click="handleRetry">
          <span class="btn-icon">↩</span>
          重试
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

<script setup lang="ts">
// ============================================================
// 全局错误页脚本
// Nuxt 传入的 error 对象：{ url, statusCode, statusMessage, message, stack }
// ============================================================

import type { NuxtError } from '#app'
import './assets/css/404.css'

const props = defineProps<{ error: NuxtError }>()

/** 返回首页（清除错误状态并跳转） */
function handleRecover(): void {
  clearError({ redirect: '/' })
}

/** 重试当前页面 */
function handleRetry(): void {
  clearError({ redirect: '/' })
}
</script>
