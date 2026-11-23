<template>
  <!-- JSON 渲染器：展开（缩进格式化）/ 折叠（单行）两种视图 + 一键复制 -->
  <div class="json-viewer">
    <div class="viewer-header">
      <n-button size="tiny" secondary @click="expanded = !expanded">
        {{ expanded ? 'COLLAPSE' : 'EXPAND' }}
      </n-button>
      <n-button size="tiny" secondary @click="copyCode">
        <template #icon><span>📋</span></template>
        COPY
      </n-button>
    </div>
    <pre v-if="expanded" class="json-content"><code v-html="formatted"></code></pre>
    <pre v-else class="json-content collapsed">{{ JSON.stringify(parsed) }}</pre>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// JSON 渲染器
// ============================================================
import { isJsonContent } from '~/utils/fileType'

const props = defineProps<{ content: string }>()

const expanded = ref<boolean>(true)

/** 解析结果（解析失败为 null） */
const parsed = computed<unknown | null>(() => {
  try {
    return JSON.parse(props.content)
  } catch {
    return null
  }
})

/** 格式化输出（2 空格缩进；解析失败回退原文） */
const formatted = computed<string>(() => {
  if (!parsed.value) return props.content
  return JSON.stringify(parsed.value, null, 2)
})

/**
 * 复制原文到剪贴板，按钮文案短暂置为 COPIED!
 * @param event 点击事件
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

// 供类型嗅探复用（保留导出语义）
defineExpose({ isJsonContent })
</script>
