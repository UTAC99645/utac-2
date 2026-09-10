<template>
  <!-- ========================================================== -->
  <!-- 链接预览 / 万能文件查看器
       输入：url（父组件 pages/index.vue 传入）
       输出：back 事件（点击 Back 返回搜索页）
       能力：根据 URL 后缀（必要时嗅探内容）识别文件类型，
             以对应方式渲染 —— Markdown / HTML / 图片 / PDF /
             音视频 / 代码高亮 / JSON / 纯文本 / 沙盒网页
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

    <!-- ---------- 内容区：按识别出的文件类型选择渲染器 ---------- -->
    <div v-else class="glass-content">

      <!-- Markdown：marked 渲染为 HTML -->
      <div v-if="fileType === 'markdown'" class="markdown-body" v-html="renderedContent"></div>
      <!-- HTML：直接渲染（注意：内容来自外部 URL，见 loadFile 的 fetch） -->
      <div v-else-if="fileType === 'html'" class="html-body" v-html="renderedContent"></div>

      <!-- 图片 -->
      <div v-else-if="fileType === 'image'" class="media-viewer">
        <img :src="url" alt="Preview" @load="handleMediaLoad" @error="handleMediaError" />
      </div>

      <!-- PDF：沙盒 iframe -->
      <div v-else-if="fileType === 'pdf'" class="media-viewer pdf-viewer">
        <iframe :src="pdfUrl" frameborder="0" sandbox="allow-scripts allow-same-origin allow-forms" allowfullscreen></iframe>
      </div>

      <!-- 视频 -->
      <div v-else-if="fileType === 'video'" class="media-viewer video-viewer">
        <video controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="videoMimeType">[VIDEO NOT SUPPORTED]
        </video>
      </div>

      <!-- 音频 -->
      <div v-else-if="fileType === 'audio'" class="media-viewer audio-viewer">
        <audio controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="audioMimeType">[AUDIO NOT SUPPORTED]
        </audio>
      </div>

      <!-- 代码：highlight.js 语法高亮 + 一键复制 -->
      <div v-else-if="fileType === 'code'" class="code-viewer">
        <div class="viewer-header">
          <n-tag type="success" size="small" round>{{ codeLanguage }}</n-tag>
          <n-button size="tiny" secondary @click="copyCode">
            <template #icon><span>📋</span></template>
            COPY
          </n-button>
        </div>
        <pre><code ref="codeBlock" :class="'language-' + codeLanguage" v-text="content"></code></pre>
      </div>

      <!-- JSON：展开（缩进格式化）/ 折叠（单行）两种视图 -->
      <div v-else-if="fileType === 'json'" class="json-viewer">
        <div class="viewer-header">
          <n-button size="tiny" secondary @click="jsonExpanded = !jsonExpanded">
            {{ jsonExpanded ? 'COLLAPSE' : 'EXPAND' }}
          </n-button>
          <n-button size="tiny" secondary @click="copyCode">
            <template #icon><span>📋</span></template>
            COPY
          </n-button>
        </div>
        <pre v-if="jsonExpanded" class="json-content"><code v-html="formattedJson"></code></pre>
        <pre v-else class="json-content collapsed">{{ JSON.stringify(parsedJson) }}</pre>
      </div>

      <!-- 外部网页：沙盒 iframe + 安全提示 + 加载指示 -->
      <div v-else-if="fileType === 'web'" class="web-viewer">
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
          @load="iframeLoaded = true"
        ></iframe>
        <div v-if="!iframeLoaded" class="iframe-loading">
          <n-spin size="small" />
          <span>LOADING EXTERNAL RESOURCE...</span>
        </div>
      </div>

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
// 链接预览 / 文件查看器脚本
// ============================================================

// ---------- Vue 核心 API ----------
import { ref, computed, watch, nextTick } from 'vue'

// ---------- 渲染依赖：Markdown + 代码高亮（暗色主题） ----------
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// ---------- 页面样式 ----------
import '../assets/css/link.css'

// ---------- 图标 ----------
import { ErrorCircle24Regular, Warning24Regular, QuestionCircle24Regular } from '@vicons/fluent'

// ============================================================
// 类型 & 组件接口
// ============================================================

// 可识别的文件类型（error 为加载失败后的展示态）
type FileType =
  | 'web' | 'markdown' | 'html' | 'image' | 'pdf'
  | 'video' | 'audio' | 'code' | 'json' | 'text'
  | 'unknown' | 'error'

interface Props {
  url: string // 待预览的资源地址
}

const props = defineProps<Props>()

// back：点击 Back 按钮时通知父组件退出预览
const emit = defineEmits<{
  (e: 'back'): void
}>()

// ============================================================
// 响应式状态
// ============================================================

const content = ref<string>('')            // 文本类资源的原始内容
const loading = ref<boolean>(false)        // 是否正在拉取资源
const error = ref<string | null>(null)     // 加载失败信息
const jsonExpanded = ref<boolean>(true)    // JSON 展开 / 折叠
const iframeLoaded = ref<boolean>(false)   // 外部网页 iframe 是否加载完成
const fileSize = ref<string>('')           // 资源大小（来自响应头 content-length）

const codeBlock = ref<HTMLElement | null>(null) // 代码 <code> 元素引用（供高亮）

// ============================================================
// 文件类型识别
// 优先级：web 特征 -> 各类扩展名 -> 内容嗅探（JSON / HTML）-> unknown
// ============================================================

/**
 * 识别 URL 对应文件的展示类型
 * @returns 识别出的 FileType（web/markdown/html/image/pdf/video/audio/code/json/text/unknown/error）
 */
const fileType = computed<FileType>(() => {
  if (!props.url) return 'unknown'

  const lowerUrl = props.url.toLowerCase()

  // 无文件扩展名的 http(s) 地址视为网页；带 format=web 参数可强制指定
  if (lowerUrl.match(/^https?:\/\//) && !lowerUrl.match(/\.\w{2,5}($|\?)/)) {
    return 'web'
  }
  if (lowerUrl.match(/[?&]format=web/)) return 'web'
  if (lowerUrl.match(/\.(md|markdown)($|\?)/)) return 'markdown'
  if (lowerUrl.match(/\.(html|htm|xhtml)($|\?)/)) return 'html'
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)($|\?)/)) return 'image'
  if (lowerUrl.match(/\.pdf($|\?)/)) return 'pdf'
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/)) return 'video'
  if (lowerUrl.match(/\.(mp3|wav|ogg|m4a|flac)($|\?)/)) return 'audio'
  if (lowerUrl.match(/\.json($|\?)/)) return 'json'

  // 代码类扩展名（高亮语言的映射见 codeLanguage）
  const codeExts = [
    'js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'rb', 'go', 'rs', 'java',
    'c', 'cpp', 'h', 'cs', 'php', 'css', 'scss', 'sass', 'less',
    'sql', 'sh', 'bash', 'zsh', 'yaml', 'yml', 'xml', 'toml'
  ]
  if (codeExts.some(ext => lowerUrl.match(new RegExp(`\\.${ext}($|\\?)`)))) return 'code'
  if (lowerUrl.match(/\.(txt|log|cfg|ini|conf)($|\?)/)) return 'text'

  // 扩展名无法判断时，基于已拉取的内容嗅探（仅当内容已存在）
  if (content.value) {
    if (isJsonContent(content.value)) return 'json'
    if (isHtmlContent(content.value)) return 'html'
  }

  return 'unknown'
})

// ============================================================
// 渲染用计算属性
// ============================================================

// Markdown 渲染为 HTML；其余类型原样返回
// 注意：marked v5+ 已移除 sanitize 选项（不再内置 HTML 过滤），
//       此处直接输出渲染结果，对来自外部 URL 的内容存在 XSS 风险
// @returns 渲染后的 HTML（markdown 类型）或原文（其余类型）
const renderedContent = computed<string>(() => {
  if (fileType.value === 'markdown') {
    return marked.parse(content.value || '') as string
  }
  return content.value
})

// JSON 解析结果（解析失败为 null，供折叠视图与格式化使用）
// @returns 解析出的对象/数组，解析失败则为 null
const parsedJson = computed<unknown | null>(() => {
  try {
    return JSON.parse(content.value)
  } catch {
    return null
  }
})

// 格式化后的 JSON（2 空格缩进；解析失败时回退为原文）
// @returns 格式化字符串
const formattedJson = computed<string>(() => {
  if (!parsedJson.value) return content.value
  return JSON.stringify(parsedJson.value, null, 2)
})

// 代码高亮语言：由扩展名映射到 highlight.js 语言名
// 扩展名提取链：最后一段 -> 去掉 query 参数 -> 转小写；
// 链中两处都可能为 undefined（无扩展名 / 空串），缺省回退 plaintext
// @returns 高亮语言名（如 'javascript'），未知扩展名回退 'plaintext'
const codeLanguage = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
    vue: 'xml', py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
    java: 'java', c: 'c', cpp: 'cpp', h: 'c', cs: 'csharp',
    php: 'php', css: 'css', scss: 'scss', sass: 'scss',
    less: 'less', sql: 'sql', sh: 'bash', bash: 'bash',
    zsh: 'bash', yaml: 'yaml', yml: 'yaml', xml: 'xml', toml: 'ini'
  }
  return langMap[ext] || 'plaintext'
})

// 视频 MIME：由扩展名推断（默认 video/mp4）
// @returns 视频 MIME 类型字符串
const videoMimeType = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/quicktime'
  }
  return mimeMap[ext] || 'video/mp4'
})

// 音频 MIME：由扩展名推断（默认 audio/mpeg）
// @returns 音频 MIME 类型字符串
const audioMimeType = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    m4a: 'audio/mp4', flac: 'audio/flac'
  }
  return mimeMap[ext] || 'audio/mpeg'
})

// PDF 地址：目前无论何种 URL 均原样返回（if/else 两分支相同，属占位逻辑）
// 预留：对 Google Docs 等场景可在此替换为对应的在线查看器地址
// @returns PDF 地址（当前恒等于 props.url）
const pdfUrl = computed<string>(() => {
  if (props.url.includes('google.com') || props.url.includes('docs.google.com')) {
    return props.url
  }
  return props.url
})

// ============================================================
// 方法
// ============================================================

// 返回搜索页
// @returns 无（副作用：向父组件发出 back 事件）
const handleBack = (): void => {
  emit('back')
}

/**
 * 拉取文本类资源
 * 图片 / 音视频 / PDF / 网页由浏览器标签直接加载，无需 fetch；
 * 其余类型 fetch 原文存入 content，30s 超时自动中止
 * @returns 无（副作用：填充 content / 设置 error / 更新 loading）
 */
const loadFile = async (): Promise<void> => {
  loading.value = true
  error.value = null
  iframeLoaded.value = false

  if (['image', 'video', 'audio', 'pdf', 'web'].includes(fileType.value)) {
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

// 对代码块执行 highlight.js 高亮
// @returns 无（副作用：就地高亮 codeBlock 元素的语法着色）
const highlightCode = (): void => {
  if (codeBlock.value) {
    hljs.highlightElement(codeBlock.value)
  }
}

// 复制原文到剪贴板，并将按钮文案短暂置为 COPIED!（2s 后恢复）
// @param event 点击事件（用于定位按钮以临时改文案）
// @returns 无（副作用：写剪贴板 + 按钮文案变化）
const copyCode = (event: MouseEvent): void => {
  navigator.clipboard.writeText(content.value).then(() => {
    const btn = event.target as HTMLButtonElement
    const originalText = btn.textContent || ''
    btn.textContent = 'COPIED!'
    setTimeout(() => {
      btn.textContent = originalText
    }, 2000)
  })
}

// 内容嗅探：是否为合法 JSON
// @param str 待检测的文本内容
// @returns 可被 JSON.parse 解析则为 true，否则 false
const isJsonContent = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// 内容嗅探：是否以常见 HTML 标签开头
// @param str 待检测的文本内容
// @returns 以常见 HTML 标签开头则为 true，否则 false
const isHtmlContent = (str: string): boolean => {
  return !!str.trim().match(/^<(!doctype|html|head|body|div|span|p|a|img|br|hr|table|ul|ol|li|h[1-6]|header|footer|nav|section|article|main|aside|figure|figcaption|code|pre|blockquote)/i)
}

// 字节数格式化为人类可读（Bytes / KB / MB / GB，保留两位小数）
// @param bytes 原始字节数
// @returns 形如 "1.50 MB" 的可读字符串
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 媒体加载成功：仅打日志（占位回调）
// @returns 无
const handleMediaLoad = (): void => {
  console.log('Media loaded successfully')
}

// 媒体加载失败：进入错误展示态
// @returns 无（副作用：设置 error 文案）
const handleMediaError = (): void => {
  error.value = 'Failed to load media resource'
}

// ============================================================
// 监听器
// ============================================================

// url 变化（含挂载时的首次赋值）-> 重新拉取资源
watch(() => props.url, (newUrl) => {
  if (newUrl) loadFile()
}, { immediate: true })

// 内容就绪且类型为代码 -> 下一帧执行语法高亮
watch(content, (newContent) => {
  if (newContent && fileType.value === 'code') {
    nextTick(() => highlightCode())
  }
})
</script>
