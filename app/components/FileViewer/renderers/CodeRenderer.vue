<template>
  <!-- 代码渲染器：highlight.js 语法高亮 + 一键复制 -->
  <div class="code-viewer">
    <div class="viewer-header">
      <n-tag type="success" size="small" round>{{ language }}</n-tag>
      <n-button size="tiny" secondary @click="copyCode">
        <template #icon><span>📋</span></template>
        COPY
      </n-button>
    </div>
    <pre><code ref="codeBlock" :class="'language-' + language" v-text="content"></code></pre>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 代码渲染器
// ============================================================
import hljs from 'highlight.js'

const props = defineProps<{ content: string; language: string }>()

const codeBlock = ref<HTMLElement | null>(null)

/** 就地对代码块执行语法高亮 */
function highlight(): void {
  if (codeBlock.value) {
    hljs.highlightElement(codeBlock.value)
  }
}

/**
 * 复制原文到剪贴板，按钮文案短暂置为 COPIED!（2s 后恢复）
 * @param event 点击事件（用于定位按钮临时改文案）
 */
function copyCode(event: MouseEvent): void {
  navigator.clipboard.writeText(props.content).then(() => {
    const btn = event.target as HTMLButtonElement
    const originalText = btn.textContent || ''
    btn.textContent = 'COPIED!'
    setTimeout(() => {
      btn.textContent = originalText
    }, 2000)
  })
}

// 内容就绪 -> 下一帧高亮
watch(() => props.content, (c) => {
  if (c) nextTick(highlight)
}, { immediate: true })
</script>
