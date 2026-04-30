<template>
  <!-- ========================================================== -->
  <!-- 文件预览组件（LinkViewer）
       功能：根据 URL 自动检测文件类型并渲染
       支持：Markdown、HTML、图片、PDF、视频、音频、代码高亮、JSON、纯文本、网页 iframe
  -->
  <!-- ========================================================== -->
  <div class="link-preview-container">

    <!-- ---------- 顶部操作栏 ---------- -->
    <div class="glass-header">
      <n-button
        class="back-btn"
        type="warning"
        size="small"
        dashed
        @click="handleBack"
      >
        <template #icon>
          <span>↩</span>
        </template>
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

    <!-- ---------- 加载状态 ---------- -->
    <div v-if="loading" class="state-card loading-state">
      <n-spin size="large" />
      <p class="state-text">加载资源中...</p>
    </div>

    <!-- ---------- 错误状态 ---------- -->
    <div v-else-if="error" class="state-card error-state">
      <n-icon size="48" :component="ErrorCircle" />
      <p class="state-title">加载失败</p>
      <p class="state-desc">{{ error }}</p>
    </div>

    <!-- ---------- 内容区域 ---------- -->
    <div v-else class="glass-content">

      <!-- Markdown 渲染 -->
      <div v-if="fileType === 'markdown'" class="markdown-body" v-html="renderedContent"></div>

      <!-- HTML 渲染 -->
      <div v-else-if="fileType === 'html'" class="html-body" v-html="renderedContent"></div>

      <!-- 图片预览 -->
      <div v-else-if="fileType === 'image'" class="media-viewer">
        <img :src="url" alt="Preview" @load="handleMediaLoad" @error="handleMediaError" />
      </div>

      <!-- PDF 嵌入 -->
      <div v-else-if="fileType === 'pdf'" class="media-viewer pdf-viewer">
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
        <div class="viewer-header">
          <n-tag type="success" size="small" round>{{ codeLanguage }}</n-tag>
          <n-button size="tiny" secondary @click="copyCode">
            <template #icon>
              <span>📋</span>
            </template>
            COPY
          </n-button>
        </div>
        <pre><code ref="codeBlock" :class="'language-' + codeLanguage" v-text="content"></code></pre>
      </div>

      <!-- JSON 格式化 -->
      <div v-else-if="fileType === 'json'" class="json-viewer">
        <div class="viewer-header">
          <n-button size="tiny" secondary @click="jsonExpanded = !jsonExpanded">
            {{ jsonExpanded ? 'COLLAPSE' : 'EXPAND' }}
          </n-button>
          <n-button size="tiny" secondary @click="copyCode">
            <template #icon>
              <span>📋</span>
            </template>
            COPY
          </n-button>
        </div>
        <pre v-if="jsonExpanded" class="json-content"><code v-html="formattedJson"></code></pre>
        <pre v-else class="json-content collapsed">{{ JSON.stringify(parsedJson) }}</pre>
      </div>

      <!-- 网页浏览 (iframe) -->
      <div v-else-if="fileType === 'web'" class="web-viewer">
        <div class="web-warning">
          <n-icon size="16" :component="Warning" />
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

      <!-- 未知格式提示 -->
      <div v-else class="unknown-type">
        <n-icon size="48" :component="HelpCircle" />
        <p class="unknown-title">未知文件格式</p>
        <p class="unknown-hint">Supported: md, html, js, css, py, json, jpg, png, gif, pdf, mp4, mp3, txt...</p>
        <n-button type="primary" tag="a" :href="url" target="_blank" download>
          DOWNLOAD FILE
        </n-button>
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

<script>
// ============================================================
// 文件预览组件脚本（Options API）
// ============================================================

import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

export default {
  name: 'LinkViewer',

  // ==========================================================
  // Props
  // ==========================================================
  props: {
    url: {
      type: String,
      required: true
    }
  },

  // ==========================================================
  // Emits
  // ==========================================================
  emits: ['back'],

  // ==========================================================
  // 内部状态
  // ==========================================================
  data() {
    return {
      content: '',
      loading: false,
      error: null,
      jsonExpanded: true,
      iframeLoaded: false,
      fileSize: ''
    };
  },

  // ==========================================================
  // 计算属性
  // ==========================================================
  computed: {
    /**
     * 根据 URL 判断文件类型
     */
    fileType() {
      if (!this.url) return 'unknown';

      const lowerUrl = this.url.toLowerCase();

      if (lowerUrl.match(/^https?:\/\//) && !lowerUrl.match(/\.\w{2,5}($|\?)/)) {
        return 'web';
      }
      if (lowerUrl.match(/[?&]format=web/)) return 'web';
      if (lowerUrl.match(/\.(md|markdown)($|\?)/)) return 'markdown';
      if (lowerUrl.match(/\.(html|htm|xhtml)($|\?)/)) return 'html';
      if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)($|\?)/)) return 'image';
      if (lowerUrl.match(/\.pdf($|\?)/)) return 'pdf';
      if (lowerUrl.match(/\.(mp4|webm|ogg|mov)($|\?)/)) return 'video';
      if (lowerUrl.match(/\.(mp3|wav|ogg|m4a|flac)($|\?)/)) return 'audio';
      if (lowerUrl.match(/\.json($|\?)/)) return 'json';

      const codeExts = ['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'css', 'scss', 'sass', 'less', 'sql', 'sh', 'bash', 'zsh', 'yaml', 'yml', 'xml', 'toml'];
      if (codeExts.some(ext => lowerUrl.match(new RegExp(`\\.${ext}($|\\?)`)))) return 'code';
      if (lowerUrl.match(/\.(txt|log|cfg|ini|conf)($|\?)/)) return 'text';

      if (this.content) {
        if (this.isJsonContent(this.content)) return 'json';
        if (this.isHtmlContent(this.content)) return 'html';
      }

      return 'unknown';
    },

    /**
     * 渲染后的内容（Markdown 需要解析，其余原样返回）
     */
    renderedContent() {
      if (this.fileType === 'markdown') {
        return marked.parse(this.content || '', { sanitize: false });
      }
      return this.content;
    },

    /**
     * 解析后的 JSON 对象
     */
    parsedJson() {
      try {
        return JSON.parse(this.content);
      } catch {
        return null;
      }
    },

    /**
     * 格式化后的 JSON 字符串（2 空格缩进）
     */
    formattedJson() {
      if (!this.parsedJson) return this.content;
      return JSON.stringify(this.parsedJson, null, 2);
    },

    /**
     * 根据文件扩展名映射代码高亮语言
     */
    codeLanguage() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase();
      const langMap = {
        'js': 'javascript', 'ts': 'typescript', 'jsx': 'jsx', 'tsx': 'tsx',
        'vue': 'xml', 'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust',
        'java': 'java', 'c': 'c', 'cpp': 'cpp', 'h': 'c', 'cs': 'csharp',
        'php': 'php', 'css': 'css', 'scss': 'scss', 'sass': 'scss',
        'less': 'less', 'sql': 'sql', 'sh': 'bash', 'bash': 'bash',
        'zsh': 'bash', 'yaml': 'yaml', 'yml': 'yaml', 'xml': 'xml', 'toml': 'ini'
      };
      return langMap[ext] || 'plaintext';
    },

    /**
     * 视频 MIME 类型映射
     */
    videoMimeType() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase();
      const mimeMap = { 'mp4': 'video/mp4', 'webm': 'video/webm', 'ogg': 'video/ogg', 'mov': 'video/quicktime' };
      return mimeMap[ext] || 'video/mp4';
    },

    /**
     * 音频 MIME 类型映射
     */
    audioMimeType() {
      const ext = this.url.split('.').pop().split('?')[0].toLowerCase();
      const mimeMap = { 'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg', 'm4a': 'audio/mp4', 'flac': 'audio/flac' };
      return mimeMap[ext] || 'audio/mpeg';
    },

    /**
     * PDF 嵌入 URL（可扩展第三方 PDF 查看器）
     */
    pdfUrl() {
      if (this.url.includes('google.com') || this.url.includes('docs.google.com')) {
        return this.url;
      }
      return this.url;
    }
  },

  // ==========================================================
  // 监听器
  // ==========================================================
  watch: {
    url: {
      immediate: true,
      handler(newUrl) {
        if (newUrl) this.loadFile();
      }
    },
    content: {
      immediate: false,
      handler(newContent) {
        if (newContent && this.fileType === 'code') {
          this.$nextTick(() => this.highlightCode());
        }
      }
    }
  },

  // ==========================================================
  // 方法
  // ==========================================================
  methods: {
    handleBack() {
      this.$emit('back');
    },

    async loadFile() {
      this.loading = true;
      this.error = null;
      this.iframeLoaded = false;

      if (['image', 'video', 'audio', 'pdf', 'web'].includes(this.fileType)) {
        this.loading = false;
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(this.url, {
          signal: controller.signal,
          headers: { 'Accept': '*/*' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          this.fileSize = this.formatFileSize(parseInt(contentLength));
        }

        this.content = await response.text();
      } catch (err) {
        if (err.name === 'AbortError') {
          this.error = 'Request timeout (30s)';
        } else {
          this.error = `Failed to load resource: ${err.message}`;
        }
      } finally {
        this.loading = false;
      }
    },

    highlightCode() {
      if (this.$refs.codeBlock) {
        hljs.highlightElement(this.$refs.codeBlock);
      }
    },

    copyCode() {
      navigator.clipboard.writeText(this.content).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'COPIED!';
        setTimeout(() => { btn.textContent = originalText; }, 2000);
      });
    },

    isJsonContent(str) {
      try { JSON.parse(str); return true; } catch { return false; }
    },

    isHtmlContent(str) {
      return str.trim().match(/^<(!doctype|html|head|body|div|span|p|a|img|br|hr|table|ul|ol|li|h[1-6]|header|footer|nav|section|article|main|aside|figure|figcaption|code|pre|blockquote)/i);
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    handleMediaLoad() {
      console.log('Media loaded successfully');
    },

    handleMediaError() {
      this.error = 'Failed to load media resource';
    }
  }
};
</script>

<style scoped>
/* ============================================================
   LinkViewer 样式 - 与首页深色毛玻璃主题统一
   ============================================================ */

.link-preview-container {
  min-height: 60vh;
  color: var(--text-secondary, #eee);
  font-family: var(--font-body, MapleMono, sans-serif);
  padding: 0;
  margin: 0;
  line-height: 1.6;
}

/* ---------- 顶部操作栏 ---------- */
.glass-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-lg);
  margin-bottom: var(--space-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.back-btn {
  flex-shrink: 0;
}

.file-path {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  letter-spacing: 0.5px;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 4px;
}

.path-prompt {
  color: var(--color-primary, #CA4346);
  font-weight: bold;
}

.path-url {
  color: var(--text-muted, #c0c0c0);
}

.file-badge {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.size-text {
  font-size: 12px;
  color: var(--text-muted, #c0c0c0);
  font-family: var(--font-mono);
}

/* ---------- 状态卡片 ---------- */
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: var(--space-lg);
}

.state-text {
  color: var(--text-muted, #c0c0c0);
  font-size: 14px;
}

.state-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary, #CA4346);
}

.state-desc {
  font-size: 13px;
  color: var(--text-muted, #c0c0c0);
  text-align: center;
  max-width: 80%;
}

/* ---------- 内容区域 ---------- */
.glass-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

/* ---------- Markdown 样式 ---------- */
.markdown-body {
  color: var(--text-secondary, #eee);
}

.markdown-body :deep(h1) {
  color: var(--text-primary, #fff);
  font-size: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
  margin-top: 32px;
}

.markdown-body :deep(h2) {
  color: #ddd;
  font-size: 22px;
  margin-top: 24px;
}

.markdown-body :deep(h3) {
  color: #aaa;
  font-size: 18px;
  margin-top: 20px;
}

.markdown-body :deep(p) {
  margin: 14px 0;
  line-height: 1.8;
}

.markdown-body :deep(a) {
  color: var(--color-primary, #CA4346);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(code) {
  background-color: rgba(0, 0, 0, 0.4);
  color: var(--color-success, #10b981);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 16px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: none;
  color: var(--color-success, #10b981);
  padding: 0;
}

.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 28px;
  margin: 14px 0;
}

.markdown-body :deep(li) {
  margin: 6px 0;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--color-primary-50, #CA434688);
  margin: 18px 0;
  padding-left: 18px;
  color: #888;
  font-style: italic;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 32px 0;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 18px 0;
}

.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  text-align: left;
}

.markdown-body :deep(th) {
  background-color: rgba(0, 0, 0, 0.3);
  color: var(--text-primary, #fff);
}

/* ---------- HTML 内容 ---------- */
.html-body {
  color: var(--text-secondary, #eee);
}

.html-body :deep(*) {
  max-width: 100%;
}

/* ---------- 媒体查看器 ---------- */
.media-viewer {
  margin: 16px 0;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 20px;
  position: relative;
}

.media-viewer img {
  max-width: 100%;
  max-height: 70vh;
  display: block;
  margin: 0 auto;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
}

.video-viewer video {
  max-width: 100%;
  max-height: 60vh;
  background-color: #000;
  border-radius: var(--radius-sm);
}

.audio-viewer {
  padding: 32px 20px;
}

.audio-viewer audio {
  width: 100%;
  filter: invert(1) hue-rotate(180deg);
}

/* ---------- PDF 查看器 ---------- */
.pdf-viewer {
  width: 100%;
  height: 70vh;
  background: rgba(0, 0, 0, 0.3);
}

.pdf-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: var(--radius-sm);
}

/* ---------- 代码 / JSON 查看器 ---------- */
.code-viewer, .json-viewer {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  margin: 16px 0;
  overflow: hidden;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.code-viewer pre, .json-viewer pre {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.2);
}

.code-viewer code, .json-viewer code {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.json-content {
  color: var(--color-success, #10b981);
}

.json-content.collapsed {
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---------- 网页查看器 ---------- */
.web-viewer {
  position: relative;
  width: 100%;
  height: 70vh;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  background: #000;
  overflow: hidden;
}

.web-viewer iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.web-warning {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: var(--color-primary, #CA4346);
  color: #000;
  padding: 6px;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.iframe-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-primary, #CA4346);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---------- 纯文本 ---------- */
.text-viewer {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  margin: 16px 0;
  padding: 20px;
  overflow-x: auto;
}

.text-viewer pre {
  margin: 0;
  color: var(--text-secondary, #eee);
  font-family: var(--font-mono);
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.8;
}

/* ---------- 未知格式 ---------- */
.unknown-type {
  color: var(--color-primary, #CA4346);
  text-align: center;
  padding: 48px 24px;
}

.unknown-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 12px 0 8px;
}

.unknown-hint {
  color: var(--text-muted, #c0c0c0);
  font-size: 12px;
  margin: 12px 0 24px;
  line-height: 1.8;
}

/* ---------- 页脚 ---------- */
.preview-footer {
  text-align: center;
  padding: 24px;
  color: #444;
  font-size: 13px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.preview-footer .sep {
  color: #333;
}

.cursor-blink {
  animation: blink 1s infinite;
  color: var(--color-primary, #CA4346);
}

@keyframes blink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .glass-content {
    padding: var(--space-lg);
  }

  .web-viewer, .pdf-viewer {
    height: 55vh;
  }

  .media-viewer img {
    max-height: 55vh;
  }
}
</style>
