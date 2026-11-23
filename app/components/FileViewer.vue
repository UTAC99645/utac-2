<template>
  <!-- ========================================================== -->
  <!-- 链接预览 / 万能文件查看器
       输入：url（父组件传入）
       输出：back 事件（点击 Back 返回）
       职责：识别文件类型并分发到对应渲染器
       （渲染器实现见 components/FileViewer/renderers/）
  -->
  <!-- ========================================================== -->
  <div class="link-preview-container">

    <!-- ---------- 顶部操作栏：返回按钮 + 当前 URL + 类型徽章 ---------- -->
    <div class="glass-header">
      <n-button class="back-btn" type="warning" size="small" dashed @click="handleBack">
        <template #icon><span>↩</span></template>
        Back
      </n-button>
      <div class="file-path">
        <span class="path-prompt">> </span>
        <span class="path-url">{{ url }}</span>
      </div>
      <div class="file-badge" v-if="fileType !== 'unknown'">
        <n-tag :type="fileType === 'error' ? 'error' : 'info'" size="small" round>
          {{ fileType.toUpperCase() }}
        </n-tag>
        <span v-if="fileSize" class="size-text">{{ fileSize }}</span>
      </div>
    </div>

    <!-- ---------- 加载中状态 ---------- -->
    <div v-if="loading" class="state-card loading-state">
      <n-spin size="large" />
      <p class="state-text">加载资源中...</p>
    </div>

    <!-- ---------- 加载失败状态 ---------- -->
    <div v-else-if="error" class="state-card error-state">
      <n-icon size="48" :component="ErrorCircle24Regular" />
      <p class="state-title">加载失败</p>
      <p class="state-desc">{{ error }}</p>
    </div>

    <!-- ---------- 内容区：按识别出的文件类型分发渲染器 ---------- -->
    <div v-else class="glass-content">

      <!-- Markdown -->
      <MarkdownRenderer v-if="fileType === 'markdown'" :content="content" />
      <div v-else-if="fileType === 'html'" class="html-body" v-html="content"></div>

      <!-- 图片 / PDF / 视频 / 音频 -->
      <MediaRenderer
        v-else-if="['image', 'pdf', 'video', 'audio'].includes(fileType)"
        :type="fileType" :url="url"
        @loaded="onMediaLoaded" @failed="onMediaFailed"
      />

      <!-- 代码 -->
      <CodeRenderer v-else-if="fileType === 'code'" :content="content" :language="codeLanguage" />

      <!-- JSON -->
      <JsonRenderer v-else-if="fileType === 'json'" :content="content" />

      <!-- 外部网页 -->
      <WebRenderer v-else-if="fileType === 'web'" :url="url" />

      <!-- 纯文本 -->
      <div v-else-if="fileType === 'text'" class="text-viewer">
        <pre v-text="content"></pre>
      </div>

      <!-- 未知格式：提示支持的类型并提供下载 -->
      <div v-else class="unknown-type">
        <n-icon size="48" :component="QuestionCircle24Regular" />
        <p class="unknown-title">未知文件格式</p>
        <p class="unknown-hint">Supported: md, html, js, css, py, json, jpg, png, gif, pdf, mp4, mp3, txt...</p>
        <n-button type="primary" tag="a" :href="url" target="_blank" download>DOWNLOAD FILE</n-button>
      </div>
    </div>

    <!-- ---------- 页脚 ---------- -->
    <footer class="preview-footer">
      <span>UTAC99645</span>
      <span class="sep">|</span>
      <span>{{ fileType.toUpperCase() }}</span>
      <span class="sep">|</span>
      <span class="cursor-blink">_</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 链接预览 / 文件查看器（编排组件）
// 类型识别在 utils/fileType.ts（纯函数），渲染在 renderers/ 子组件
// ============================================================

import { ErrorCircle24Regular, QuestionCircle24Regular } from '@vicons/fluent'
import { detectFileType, codeLanguageOf, formatFileSize } from '~/utils/fileType'
import type { FileType } from '~/utils/fileType'

// ---------- 渲染器子组件（子目录不参与自动导入，显式引入） ----------
import MarkdownRenderer from './FileViewer/renderers/MarkdownRenderer.vue'
import CodeRenderer from './FileViewer/renderers/CodeRenderer.vue'
import JsonRenderer from './FileViewer/renderers/JsonRenderer.vue'
import WebRenderer from './FileViewer/renderers/WebRenderer.vue'
import MediaRenderer from './FileViewer/renderers/MediaRenderer.vue'

interface Props {
  url: string // 待预览的资源地址
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

// ============================================================
// 响应式状态
// ============================================================

const content = ref<string>('')            // 文本类资源的原始内容
const loading = ref<boolean>(false)        // 是否正在拉取资源
const error = ref<string | null>(null)     // 加载失败信息
const iframeLoaded = ref<boolean>(false)   // 外部网页 iframe 是否加载完成
const fileSize = ref<string>('')           // 资源大小（content-length）

// ============================================================
// 类型识别与派生
// ============================================================

/** 识别出的文件类型（随 url 与已拉取内容联动） */
const fileType = computed<FileType>(() => detectFileType(props.url, content.value))

/** 代码高亮语言（仅 code 类型使用） */
const codeLanguage = computed<string>(() => codeLanguageOf(props.url))

// ============================================================
// 资源加载
// ============================================================

/**
 * 拉取文本类资源
 * 图片 / 音视频 / PDF / 网页由浏览器直接加载，无需 fetch；
 * 其余类型 fetch 原文存入 content，30s 超时自动中止
 */
const loadFile = async (): Promise<void> => {
  loading.value = true
  error.value = null
  iframeLoaded.value = false

  if (['image', 'video', 'audio', 'pdf', 'web'].includes(detectFileType(props.url))) {
    loading.value = false
    return
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(props.url, {
      signal: controller.signal,
      headers: { Accept: '*/*' }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength) {
      fileSize.value = formatFileSize(parseInt(contentLength, 10))
    }

    content.value = await response.text()
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      error.value = 'Request timeout (30s)'
    } else if (err instanceof Error) {
      error.value = `Failed to load resource: ${err.message}`
    } else {
      error.value = 'Failed to load resource: Unknown error'
    }
  } finally {
    loading.value = false
  }
}

/** 返回搜索页 */
const handleBack = (): void => {
  emit('back')
}

/** 媒体加载成功（占位回调，保留日志语义） */
const onMediaLoaded = (): void => {
  console.log('Media loaded successfully')
}

/** 媒体加载失败：进入错误展示态 */
const onMediaFailed = (): void => {
  error.value = 'Failed to load media resource'
}

// ============================================================
// 监听器
// ============================================================

// url 变化（含挂载首次）-> 重新拉取资源
watch(() => props.url, (newUrl) => {
  if (newUrl) loadFile()
}, { immediate: true })
</script>
