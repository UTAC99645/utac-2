// ============================================================
// 文件类型识别器（纯函数，供 FileViewer 使用）
// 优先级：web 特征 -> 扩展名 -> 内容嗅探（JSON / HTML）-> unknown
// 识别结果决定 FileViewer 选哪种渲染器
// ============================================================

/** 可识别的文件类型（error 为加载失败后的展示态） */
export type FileType =
  | 'web' | 'markdown' | 'html' | 'image' | 'pdf'
  | 'video' | 'audio' | 'code' | 'json' | 'text'
  | 'unknown' | 'error'

/** 代码类扩展名 -> highlight.js 语言名 映射 */
const CODE_LANG_MAP: Record<string, string> = {
  js: 'javascript', ts: 'typescript', jsx: 'jsx', tsx: 'tsx',
  vue: 'xml', py: 'python', rb: 'ruby', go: 'go', rs: 'rust',
  java: 'java', c: 'c', cpp: 'cpp', h: 'c', cs: 'csharp',
  php: 'php', css: 'css', scss: 'scss', sass: 'scss',
  less: 'less', sql: 'sql', sh: 'bash', bash: 'bash',
  zsh: 'bash', yaml: 'yaml', yml: 'yaml', xml: 'xml', toml: 'ini'
}

/** 视频 扩展名 -> MIME 映射 */
const VIDEO_MIME_MAP: Record<string, string> = {
  mp4: 'video/mp4', webm: 'video/webm', ogg: 'video/ogg', mov: 'video/quicktime'
}

/** 音频 扩展名 -> MIME 映射 */
const AUDIO_MIME_MAP: Record<string, string> = {
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  m4a: 'audio/mp4', flac: 'audio/flac'
}

/**
 * 取 URL 小写化的最后一段扩展名（剥离 query 参数）
 * @param url 资源地址
 * @returns 形如 'md' 的扩展名（无扩展名为空串）
 */
function extOf(url: string): string {
  return url.split('.').pop()?.split('?')[0]?.toLowerCase() || ''
}

/**
 * 识别 URL 对应文件的展示类型
 * @param url 资源地址
 * @param content 已拉取的文本内容（用于嗅探，可为空串）
 * @returns 识别出的 FileType
 */
export function detectFileType(url: string, content: string = ''): FileType {
  if (!url) return 'unknown'

  const lowerUrl = url.toLowerCase()

  // 无文件扩展名的 http(s) 地址视为网页；format=web 可强制指定
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
  if (Object.keys(CODE_LANG_MAP).some(ext => lowerUrl.match(new RegExp(`\\.${ext}($|\\?)`)))) return 'code'
  if (lowerUrl.match(/\.(txt|log|cfg|ini|conf)($|\?)/)) return 'text'

  // 扩展名无法判断时，基于已拉取的内容嗅探（仅当内容已存在）
  if (content) {
    if (isJsonContent(content)) return 'json'
    if (isHtmlContent(content)) return 'html'
  }
  return 'unknown'
}

/**
 * 扩展名 -> highlight.js 语言名（未知扩展名回退 plaintext）
 * @param url 资源地址
 * @returns 语言名（如 'javascript'）
 */
export function codeLanguageOf(url: string): string {
  return CODE_LANG_MAP[extOf(url)] || 'plaintext'
}

/**
 * 扩展名 -> 视频 MIME 类型（默认 video/mp4）
 * @param url 资源地址
 * @returns MIME 类型字符串
 */
export function videoMimeOf(url: string): string {
  return VIDEO_MIME_MAP[extOf(url)] || 'video/mp4'
}

/**
 * 扩展名 -> 音频 MIME 类型（默认 audio/mpeg）
 * @param url 资源地址
 * @returns MIME 类型字符串
 */
export function audioMimeOf(url: string): string {
  return AUDIO_MIME_MAP[extOf(url)] || 'audio/mpeg'
}

/**
 * 内容嗅探：是否为合法 JSON
 * @param str 待检测文本
 * @returns 可被 JSON.parse 解析则为 true
 */
export function isJsonContent(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * 内容嗅探：是否以常见 HTML 标签开头
 * @param str 待检测文本
 * @returns 以常见 HTML 标签开头则为 true
 */
export function isHtmlContent(str: string): boolean {
  return !!str.trim().match(/^<(!doctype|html|head|body|div|span|p|a|img|br|hr|table|ul|ol|li|h[1-6]|header|footer|nav|section|article|main|aside|figure|figcaption|code|pre|blockquote)/i)
}

/**
 * 字节数格式化为人类可读（Bytes / KB / MB / GB，保留两位小数）
 * @param bytes 原始字节数
 * @returns 形如 "1.50 MB" 的可读字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i]
}
