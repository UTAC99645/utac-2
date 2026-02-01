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
      
      <!-- Markdown 渲染 -->
      <div v-if="isMarkdown" class="markdown-body" v-html="renderedContent"></div>
      
      <!-- HTML 渲染 -->
      <div v-else-if="isHtml" class="html-body" v-html="renderedContent"></div>
      
      <!-- 未知格式提示 -->
      <div v-else class="unknown-type">
        [UNKNOWN FILE FORMAT]
      </div>
      
      <!-- 分隔线 -->
      <div class="terminal-divider">* * *</div>
    </div>

    <!-- 页脚 -->
    <footer class="terminal-footer">
      <span>UTAC99645</span>
      <span class="blink">_</span>
    </footer>
  </div>
</template>

<script>
import { marked } from 'marked'

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
      error: null
    }
  },

  computed: {
    isMarkdown() {
      return this.url && this.url.match(/\.(md|markdown)$/i)
    },
    isHtml() {
      return this.url && this.url.match(/\.(html|htm)$/i)
    },
    renderedContent() {
      if (this.isMarkdown) {
        return marked.parse(this.content || '')
      }
      return this.content
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
    }
  },

  methods: {
    async loadFile() {
      this.loading = true
      this.error = null
      
      try {
        const response = await fetch(this.url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        this.content = await response.text()
      } catch (err) {
        this.error = `Failed to load resource: ${err.message}`
      } finally {
        this.loading = false
      }
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

/* 导航栏 */
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #333;
  background-color: #0a0a0a;
}

.brand {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #fff;
}

/* 内容区域 */
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 40px;
}

/* 文件路径显示 */
.file-path {
  color: #444;
  font-size: 12px;
  margin-bottom: 30px;
  letter-spacing: 1px;
  word-break: break-all;
}

/* Markdown 样式 */
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

/* 未知格式 */
.unknown-type {
  color: #ff0000;
  text-align: center;
  padding: 40px;
  border: 1px dashed #333;
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
  .nav-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
  
  .content-wrapper {
    padding: 40px 20px;
  }
}
</style>

