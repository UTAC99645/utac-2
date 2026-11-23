<template>
  <!-- Markdown 渲染器：marked 输出 HTML（内容来自外部 URL，注意 XSS） -->
  <div class="markdown-body" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
// ============================================================
// Markdown 渲染器
// ============================================================
import { marked } from 'marked'

const props = defineProps<{ content: string }>()

const renderedContent = computed<string>(() => marked.parse(props.content || '') as string)
</script>
