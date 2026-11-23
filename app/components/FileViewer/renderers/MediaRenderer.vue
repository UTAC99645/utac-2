<template>
  <!-- 媒体渲染器：图片 / PDF / 视频 / 音频 按类型分发 -->
  <div>
    <!-- 图片 -->
    <div v-if="type === 'image'" class="media-viewer">
      <img :src="url" alt="Preview" @load="emit('loaded')" @error="emit('failed')" />
    </div>

    <!-- PDF：沙盒 iframe -->
    <div v-else-if="type === 'pdf'" class="media-viewer pdf-viewer">
      <iframe :src="url" frameborder="0" sandbox="allow-scripts allow-same-origin allow-forms" allowfullscreen></iframe>
    </div>

    <!-- 视频 -->
    <div v-else-if="type === 'video'" class="media-viewer video-viewer">
      <video controls @loadeddata="emit('loaded')" @error="emit('failed')">
        <source :src="url" :type="mime">[VIDEO NOT SUPPORTED]
      </video>
    </div>

    <!-- 音频 -->
    <div v-else-if="type === 'audio'" class="media-viewer audio-viewer">
      <audio controls @loadeddata="emit('loaded')" @error="emit('failed')">
        <source :src="url" :type="mime">[AUDIO NOT SUPPORTED]
      </audio>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 媒体渲染器（图片 / PDF / 视频 / 音频）
// ============================================================
import { videoMimeOf, audioMimeOf } from '~/utils/fileType'
import type { FileType } from '~/utils/fileType'

const props = defineProps<{ type: FileType; url: string }>()

const emit = defineEmits<{ (e: 'loaded'): void; (e: 'failed'): void }>()

/** 视频 / 音频的 MIME 类型（音频类型回退到音频默认值） */
const mime = computed<string>(() =>
  props.type === 'video' ? videoMimeOf(props.url) : audioMimeOf(props.url)
)
</script>
