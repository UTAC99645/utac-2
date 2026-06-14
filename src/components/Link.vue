<template>
  <div class="link-preview-container">
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

    <div v-if="loading" class="state-card loading-state">
      <n-spin size="large" />
      <p class="state-text">加载资源中...</p>
    </div>

    <div v-else-if="error" class="state-card error-state">
      <n-icon size="48" :component="ErrorCircle24Regular" />
      <p class="state-title">加载失败</p>
      <p class="state-desc">{{ error }}</p>
    </div>

    <div v-else class="glass-content">
      <div v-if="fileType === 'markdown'" class="markdown-body" v-html="renderedContent"></div>
      <div v-else-if="fileType === 'html'" class="html-body" v-html="renderedContent"></div>

      <div v-else-if="fileType === 'image'" class="media-viewer">
        <img :src="url" alt="Preview" @load="handleMediaLoad" @error="handleMediaError" />
      </div>

      <div v-else-if="fileType === 'pdf'" class="media-viewer pdf-viewer">
        <iframe :src="pdfUrl" frameborder="0" sandbox="allow-scripts allow-same-origin allow-forms" allowfullscreen></iframe>
      </div>

      <div v-else-if="fileType === 'video'" class="media-viewer video-viewer">
        <video controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="videoMimeType">[VIDEO NOT SUPPORTED]
        </video>
      </div>

      <div v-else-if="fileType === 'audio'" class="media-viewer audio-viewer">
        <audio controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="audioMimeType">[AUDIO NOT SUPPORTED]
        </audio>
      </div>

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

      <div v-else-if="fileType === 'text'" class="text-viewer">
        <pre v-text="content"></pre>
      </div>

      <div v-else class="unknown-type">
        <n-icon size="48" :component="QuestionCircle24Regular" />
        <p class="unknown-title">未知文件格式</p>
        <p class="unknown-hint">Supported: md, html, js, css, py, json, jpg, png, gif, pdf, mp4, mp3, txt...</p>
        <n-button type="primary" tag="a" :href="url" target="_blank" download>DOWNLOAD FILE</n-button>
      </div>
    </div>

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
import { ref, computed, watch, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import '../css/link.css'

import { ErrorCircle24Regular, Warning24Regular, QuestionCircle24Regular } from '@vicons/fluent'

type FileType =
  | 'web' | 'markdown' | 'html' | 'image' | 'pdf'
  | 'video' | 'audio' | 'code' | 'json' | 'text'
  | 'unknown' | 'error'

interface Props {
  url: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const content = ref<string>('')
const loading = ref<boolean>(false)
const error = ref<string | null>(null)
const jsonExpanded = ref<boolean>(true)
const iframeLoaded = ref<boolean>(false)
const fileSize = ref<string>('')

const codeBlock = ref<HTMLElement | null>(null)

const fileType = computed<FileType>(() => {
  if (!props.url) return 'unknown'

  const lowerUrl = props.url.toLowerCase()

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

  const codeExts = [
    'js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'rb', 'go', 'rs', 'java',
    'c', 'cpp', 'h', 'cs', 'php', 'css', 'scss', 'sass', 'less',
    'sql', 'sh', 'bash', 'zsh', 'yaml', 'yml', 'xml', 'toml'
  ]
  if (codeExts.some(ext => lowerUrl.match(new RegExp(`\\.${ext}($|\\?)`)))) return 'code'
  if (lowerUrl.match(/\.(txt|log|cfg|ini|conf)($|\?)/)) return 'text'

  if (content.value) {
    if (isJsonContent(content.value)) return 'json'
    if (isHtmlContent(content.value)) return 'html'
  }

  return 'unknown'
})

const renderedContent = computed<string>(() => {
  if (fileType.value === 'markdown') {
    return marked.parse(content.value || '', { sanitize: false }) as string
  }
  return content.value
})

const parsedJson = computed<unknown | null>(() => {
  try {
    return JSON.parse(content.value)
  } catch {
    return null
  }
})

const formattedJson = computed<string>(() => {
  if (!parsedJson.value) return content.value
  return JSON.stringify(parsedJson.value, null, 2)
})

const codeLanguage = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0].toLowerCase() || ''
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

const videoMimeType = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0].toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/quicktime'
  }
  return mimeMap[ext] || 'video/mp4'
})

const audioMimeType = computed<string>(() => {
  const ext = props.url.split('.').pop()?.split('?')[0].toLowerCase() || ''
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
    m4a: 'audio/mp4', flac: 'audio/flac'
  }
  return mimeMap[ext] || 'audio/mpeg'
})

const pdfUrl = computed<string>(() => {
  if (props.url.includes('google.com') || props.url.includes('docs.google.com')) {
    return props.url
  }
  return props.url
})

const handleBack = (): void => {
  emit('back')
}

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

const highlightCode = (): void => {
  if (codeBlock.value) {
    hljs.highlightElement(codeBlock.value)
  }
}

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

const isJsonContent = (str: string): boolean => {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

const isHtmlContent = (str: string): boolean => {
  return !!str.trim().match(/^<(!doctype|html|head|body|div|span|p|a|img|br|hr|table|ul|ol|li|h[1-6]|header|footer|nav|section|article|main|aside|figure|figcaption|code|pre|blockquote)/i)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleMediaLoad = (): void => {
  console.log('Media loaded successfully')
}

const handleMediaError = (): void => {
  error.value = 'Failed to load media resource'
}

watch(() => props.url, (newUrl) => {
  if (newUrl) loadFile()
}, { immediate: true })

watch(content, (newContent) => {
  if (newContent && fileType.value === 'code') {
    nextTick(() => highlightCode())
  }
})
</script>
