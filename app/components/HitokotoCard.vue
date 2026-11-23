<template>
  <!-- 一言卡片：展示句子 / 作者 / 出处 / ID，支持手动刷新（冷却锁防连点） -->
  <n-card class="n-card" embedded :bordered="false" size="small" hoverable>
    <template #header>
      <div v-if="item.from_who !== null">by: {{ item.from_who }}</div>
      <div v-else>...</div>
    </template>
    <template v-if="item.from !== null" #header-extra>from: {{ item.from }}</template>
    {{ item.hitokoto }}
    <template #action>
      ID: {{ item.id }}
      <n-divider vertical />
      <n-button @click="emit('refresh')" :loading="loading" :disabled="loading">
        GET AOTHER
      </n-button>
    </template>
  </n-card>
</template>

<script setup lang="ts">
// ============================================================
// 一言卡片脚本（单条展示）
// ============================================================

const props = defineProps<{ item: YiyanItem; loading: boolean }>()

const emit = defineEmits<{ (e: 'refresh'): void }>()
</script>
