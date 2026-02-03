<template>
  <div class="hard-driver-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="terminal-cursor">LOADING...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-code">ERROR</div>
      <div class="error-message">{{ error }}</div>
    </div>

    <!-- 内容区域 -->
    <div v-else class="content-wrapper">
      <div class="file-path">> {{ url }}</div>
      <div class="file-meta" v-if="fileType !== 'unknown'">
        [{{ fileType.toUpperCase() }}] {{ fileSize }}
      </div>

      <!-- Markdown 渲染 -->
      <div v-if="fileType === 'markdown'" class="markdown-body" v-html="renderedContent"></div>
      
      <!-- HTML 渲染 -->
      <div v-else-if="fileType === 'html'" class="html-body" v-html="renderedContent"></div>
      
      <!-- 图片预览 -->
      <div v-else-if="fileType === 'image'" class="media-viewer">
        <img :src="url" alt="Preview" @load="handleMediaLoad" @error="handleMediaError" />
      </div>

      <!-- PDF 嵌入 -->
      <div v-else-if="fileType === 'pdf'" class="pdf-viewer">
        <iframe 
          :src="pdfUrl" 
          frameborder="0" 
          sandbox="allow-scripts allow-same-origin allow-forms"
          allowfullscreen
        ></iframe>
      </div>

      <!-- 视频播放 -->
      <div v-else-if="fileType === 'video'" class="media-viewer video-viewer">
        <video controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="videoMimeType">
          [VIDEO NOT SUPPORTED]
        </video>
      </div>

      <!-- 音频播放 -->
      <div v-else-if="fileType === 'audio'" class="media-viewer audio-viewer">
        <audio controls @loadeddata="handleMediaLoad" @error="handleMediaError">
          <source :src="url" :type="audioMimeType">
          [AUDIO NOT SUPPORTED]
        </audio>
      </div>

      <!-- 代码文件 -->
      <div v-else-if="fileType === 'code'" class="code-viewer">
        <div class="code-header">
          <span class="lang-tag">{{ codeLanguage }}</span>
          <button class="copy-btn" @click="copyCode">COPY</button>
        </div>
        <pre><code ref="codeBlock" :class="'language-' + codeLanguage" v-text="content"></code></pre>
      </div>

      <!-- JSON 格式化 -->
      <div v-else-if="fileType === 'json'" class="json-viewer">
        <div class="json-header">
          <button class="toggle-btn" @click="jsonExpanded = !jsonExpanded">
            {{ jsonExpanded ? 'COLLAPSE' : 'EXPAND' }}
          </button>
          <button class="copy-btn" @click="copyCode">COPY</button>
        </div>
        <pre v-if="jsonExpanded" class="json-content"><code v-html="formattedJson"></code></pre>
        <pre v-else class="json-content collapsed">{{ JSON.stringify(parsedJson) }}</pre>
      </div>

      <!-- 网页浏览 (iframe) -->
      <div v-else-if="fileType === 'web'" class="web-viewer">
        <div class="web-warning">
          <span class="warning-icon">⚠</span>
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
          <span class="blink">LOADING EXTERNAL RESOURCE...</span>
        </div>
      </div>

      <!-- 纯文本 -->
      <div v-else-if="fileType === 'text'" class="text-viewer">
        <pre v-text="content"></pre>
      </div>

      <!-- 未知格式提示 -->
      <div v-else class="unknown-type">
        <div class="unknown-icon">?</div>
        <div>[UNKNOWN FILE FORMAT]</div>
        <div class="unknown-hint">Supported: md, html, js, css, py, json, jpg, png, gif, pdf, mp4, mp3, txt...</div>
        <a :href="url" target="_blank" download class="download-link">> DOWNLOAD FILE</a>
      </div>
      
      <!-- 分隔线 -->
      <div class="terminal-divider">* * *</div>
    </div>

    <!-- 页脚 -->
    <footer class="terminal-footer">
      <span>UTAC99645</span>
      <span class="separator">|</span>
      <span>{{ fileType.toUpperCase() }}</span>
      <span class="separator">|</span>
      <span class="blink">_</span>
    </footer>
  </div>
</template>

<script>
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

export default {
  name: 'HardDriverViewer',
  
  props: {
    url: {
      type: String,
      required: true
    }
  },

  data() {
    return {
      content: '',
      loading: false,
      error: null,
      jsonExpanded: true,
      iframeLoaded: false,
      fileSize: ''
    }
  },

  computed: {
    fileType() {
      if (!this.url) return 'unknown'
      
      const lowerUrl = this.url.toLowerCase()
      
      // 直接网页浏览（以 http:// 或 https:// 开头且无文件扩展名，或是明确标记为网页）
      if (lowerUrl.match(/^https?:\/\//) && !lowerUrl.match(/\.\w{2,5}($|\?)/)) {
        return 'web'
      }
      if (lowerUrl.match(/[?&]format=web/)) return 'web'
      
      // Markdown
      if (lowerUrl.match(/\.(md|markdown)($|\?)/)) return 'markdown'
      
      // HTML
      if (lowerUrl.match(/\.(html|htm|xhtml)($|\?)/)) return 'html'
      
      // 图片
      if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)($|\?)/)) return 'image'
      
      // PDF
      if (lowerUrl.match(/\.pdf($|\?)/)) return 'pdf'
      
      // 视频
      if (lowerUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/)) return 'video'
      
      // 音频
      if (lowerUrl.match(/\.(mp3|wav|ogg|m4a|flac)($|\?)/)) return 'audio'
      
      // JSON
      if (lowerUrl.match(/\.json($|\?)/)) return 'json'
      
      // 代码文件
      const codeExts = ['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'css', 'scss', 'sass', 'less', 'sql', 'sh', 'bash', 'zsh', 'yaml', 'yml', 'xml', 'toml']
      if (codeExts.some(ext => lowerUrl.match(new RegExp(`\\.${ext}($|\\?)`)))) return 'code'
      
      // 纯文本
      if (lowerUrl.match(/\.(txt|log|cfg|ini|conf)($|\?)/)) return 'text'
      
      // 尝试根据内容检测（如果已加载）
      if (this.content) {
        if (this.isJsonContent(this.content)) return 'json'
        if (this.isHtmlContent(this.content)) return 'html'
      }
      
      return 'unknown'
    },
    
    renderedContent() {
      if (this.fileType === 'markdown') {
        return marked.parse(this.content || '', { sanitize: false })
      }
      return this.content
    },
    
    parsedJson() {
      try {
        return JSON.parse(this.content)
      } catch {
        return null
      }
    },
    
    formattedJson() {
      if (!this.parsedJson) return this.content
      return JSON.stringify(this.parsedJson, null, 2)
    },
    
    codeLanguage() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase()
      const langMap = {
        'js': 'javascript',
        'ts': 'typescript',
        'jsx': 'jsx',
        'tsx': 'tsx',
        'vue': 'xml', // highlight.js使用xml高亮vue
        'py': 'python',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'h': 'c',
        'cs': 'csharp',
        'php': 'php',
        'css': 'css',
        'scss': 'scss',
        'sass': 'scss',
        'less': 'less',
        'sql': 'sql',
        'sh': 'bash',
        'bash': 'bash',
        'zsh': 'bash',
        'yaml': 'yaml',
        'yml': 'yaml',
        'xml': 'xml',
        'toml': 'ini'
      }
      return langMap[ext] || 'plaintext'
    },
    
    videoMimeType() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase()
      const mimeMap = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime'
      }
      return mimeMap[ext] || 'video/mp4'
    },
    
    audioMimeType() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase()
      const mimeMap = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4',
        'flac': 'audio/flac'
      }
      return mimeMap[ext] || 'audio/mpeg'
    },
    
    pdfUrl() {
      // 使用Google Docs Viewer或本地嵌入
      if (this.url.includes('google.com') || this.url.includes('docs.google.com')) {
        return this.url
      }
      // 对于跨域PDF，可以尝试使用mozilla的pdf.js viewer（需要额外部署）
      // 这里使用原生嵌入
      return this.url
    }
  },

  watch: {
    url: {
      immediate: true,
      handler(newUrl) {
        if (newUrl) {
          this.loadFile()
        }
      }
    },
    
    content: {
      immediate: false,
      handler(newContent) {
        if (newContent && this.fileType === 'code') {
          this.$nextTick(() => {
            this.highlightCode()
          })
        }
      }
    }
  },

  methods: {
    async loadFile() {
      this.loading = true
      this.error = null
      this.iframeLoaded = false
      
      // 对于媒体和iframe类型，不需要fetch内容
      if (['image', 'video', 'audio', 'pdf', 'web'].includes(this.fileType)) {
        this.loading = false
        return
      }
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
        
        const response = await fetch(this.url, { 
          signal: controller.signal,
          headers: {
            'Accept': '*/*'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        // 尝试获取文件大小
        const contentLength = response.headers.get('content-length')
        if (contentLength) {
          this.fileSize = this.formatFileSize(parseInt(contentLength))
        }
        
        this.content = await response.text()
      } catch (err) {
        if (err.name === 'AbortError') {
          this.error = 'Request timeout (30s)'
        } else {
          this.error = `Failed to load resource: ${err.message}`
        }
      } finally {
        this.loading = false
      }
    },
    
    highlightCode() {
      if (this.$refs.codeBlock) {
        hljs.highlightElement(this.$refs.codeBlock)
      }
    },
    
    copyCode() {
      navigator.clipboard.writeText(this.content).then(() => {
        // 可以添加临时提示
        const btn = event.target
        const originalText = btn.textContent
        btn.textContent = 'COPIED!'
        setTimeout(() => {
          btn.textContent = originalText
        }, 2000)
      })
    },
    
    isJsonContent(str) {
      try {
        JSON.parse(str)
        return true
      } catch {
        return false
      }
    },
    
    isHtmlContent(str) {
      return str.trim().match(/^<(!doctype|html|head|body|div|span|p|a|img|br|hr|table|ul|ol|li|h[1-6]|header|footer|nav|section|article|main|aside|figure|figcaption|code|pre|blockquote)/i)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    handleMediaLoad() {
      console.log('Media loaded successfully')
    },
    
    handleMediaError() {
      this.error = 'Failed to load media resource'
    }
  }
}
</script>

<style scoped>
/* 基础重置 */
.hard-driver-container {
  min-height: 100vh;
  background-color: #0a0a0a;
  color: #c0c0c0;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  padding: 0;
  margin: 0;
  line-height: 1.6;
}

/* 内容区域 */
.content-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 40px;
}

/* 文件元信息 */
.file-meta {
  color: #666;
  font-size: 11px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

/* 文件路径显示 */
.file-path {
  color: #444;
  font-size: 12px;
  margin-bottom: 10px;
  letter-spacing: 1px;
  word-break: break-all;
}

/* Markdown 样式（保持原有） */
.markdown-body {
  color: #c0c0c0;
}

.markdown-body :deep(h1) {
  color: #fff;
  font-size: 32px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  margin-top: 40px;
  letter-spacing: 1px;
}

.markdown-body :deep(h2) {
  color: #ddd;
  font-size: 24px;
  margin-top: 30px;
  letter-spacing: 1px;
}

.markdown-body :deep(h3) {
  color: #aaa;
  font-size: 20px;
  margin-top: 25px;
}

.markdown-body :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.markdown-body :deep(a) {
  color: #fff;
  text-decoration: underline;
  text-decoration-color: #555;
}

.markdown-body :deep(a:hover) {
  text-decoration-color: #fff;
}

.markdown-body :deep(code) {
  background-color: #1a1a1a;
  color: #0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background-color: #111;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 16px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: none;
  color: #0f0;
  padding: 0;
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 30px;
  margin: 16px 0;
}

.markdown-body :deep(li) {
  margin: 8px 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid #444;
  margin: 20px 0;
  padding-left: 20px;
  color: #888;
  font-style: italic;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #333;
  margin: 40px 0;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border: 1px solid #333;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid #333;
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: #1a1a1a;
  color: #fff;
}

/* HTML 内容样式 */
.html-body {
  color: #c0c0c0;
}

.html-body :deep(*) {
  max-width: 100%;
}

/* 图片查看器 */
.media-viewer {
  margin: 20px 0;
  text-align: center;
  background-color: #111;
  border: 1px solid #333;
  padding: 20px;
  position: relative;
}

.media-viewer img {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
}

/* 视频播放器 */
.video-viewer video {
  max-width: 100%;
  max-height: 70vh;
  background-color: #000;
}

/* 音频播放器 */
.audio-viewer {
  padding: 40px 20px;
}

.audio-viewer audio {
  width: 100%;
  filter: invert(1) hue-rotate(180deg); /* 让音频控件适配暗色主题 */
}

/* PDF 查看器 */
.pdf-viewer {
  width: 100%;
  height: 80vh;
  border: 1px solid #333;
  background-color: #111;
}

.pdf-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 代码查看器 */
.code-viewer {
  background-color: #111;
  border: 1px solid #333;
  border-radius: 4px;
  margin: 20px 0;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
}

.lang-tag {
  color: #0f0;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.copy-btn, .toggle-btn {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 4px 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.copy-btn:hover, .toggle-btn:hover {
  border-color: #fff;
  color: #fff;
  background-color: #222;
}

.code-viewer pre {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  background-color: #0d0d0d;
}

.code-viewer code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

/* JSON 查看器 */
.json-viewer {
  background-color: #111;
  border: 1px solid #333;
  border-radius: 4px;
  margin: 20px 0;
  overflow: hidden;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #1a1a1a;
  border-bottom: 1px solid #333;
}

.json-content {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  color: #0f0;
  font-size: 13px;
  line-height: 1.6;
  background-color: #0d0d0d;
}

.json-content.collapsed {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 网页查看器 */
.web-viewer {
  position: relative;
  width: 100%;
  height: 80vh;
  border: 1px solid #333;
  background-color: #000;
}

.web-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #fff; /* 网页通常是白底 */
}

.web-warning {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ff6600;
  color: #000;
  padding: 8px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.warning-icon {
  font-size: 14px;
}

.iframe-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0f0;
  font-size: 14px;
}

/* 文本查看器 */
.text-viewer {
  background-color: #111;
  border: 1px solid #333;
  border-radius: 4px;
  margin: 20px 0;
  padding: 20px;
  overflow-x: auto;
}

.text-viewer pre {
  margin: 0;
  color: #c0c0c0;
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.8;
}

/* 未知格式 */
.unknown-type {
  color: #ff0000;
  text-align: center;
  padding: 60px 40px;
  border: 1px dashed #333;
}

.unknown-icon {
  font-size: 48px;
  color: #333;
  margin-bottom: 20px;
}

.unknown-hint {
  color: #666;
  font-size: 12px;
  margin-top: 20px;
  line-height: 1.8;
}

.download-link {
  display: inline-block;
  margin-top: 30px;
  color: #0f0;
  text-decoration: none;
  border: 1px solid #0f0;
  padding: 10px 20px;
  transition: all 0.3s;
}

.download-link:hover {
  background-color: #0f0;
  color: #000;
}

/* 状态提示 */
.loading-state, .error-state {
  text-align: center;
  padding: 100px 20px;
}

.terminal-cursor {
  color: #0f0;
  font-size: 18px;
  animation: blink 1s infinite;
}

.error-code {
  font-size: 48px;
  color: #f00;
  margin-bottom: 20px;
  letter-spacing: 5px;
}

.error-message {
  color: #666;
  font-size: 14px;
}

/* 终端分隔线 */
.terminal-divider {
  text-align: center;
  color: #444;
  margin: 60px 0 40px;
  letter-spacing: 10px;
  font-size: 12px;
}

/* 页脚 */
.terminal-footer {
  text-align: center;
  padding: 40px;
  color: #444;
  font-size: 14px;
  border-top: 1px solid #1a1a1a;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.separator {
  color: #333;
}

.blink {
  animation: blink 1s infinite;
  color: #0f0;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 响应式 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 40px 20px;
  }
  
  .web-viewer, .pdf-viewer {
    height: 60vh;
  }
  
  .media-viewer img {
    max-height: 60vh;
  }
}
</style>

