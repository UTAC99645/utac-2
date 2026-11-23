<template>
  <!-- 网页渲染器：沙盒 iframe + 安全提示 + 加载指示 -->
  <div class="web-viewer">
    <div class="web-warning">
      <n-icon size="16" :component="Warning24Regular" />
      <span>EXTERNAL CONTENT - SANDBOXED</span>
    </div>
    <iframe
      :src="url"
      frameborder="0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      allow="fullscreen; autoplay; clipboard-write"
      referrerpolicy="no-referrer"
      @load="loaded = true"
    ></iframe>
    <div v-if="!loaded" class="iframe-loading">
      <n-spin size="small" />
      <span>LOADING EXTERNAL RESOURCE...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 网页渲染器（沙盒 iframe）
// ============================================================
import { Warning24Regular } from '@vicons/fluent'

defineProps<{ url: string }>()

const loaded = ref<boolean>(false)
</script>
