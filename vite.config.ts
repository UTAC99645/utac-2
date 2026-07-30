// ============================================================
// Vite 配置
// 要点：
//   1. unplugin-auto-import —— 自动注入 vue / vue-router / naive-ui /
//      axios 的常用 API（ref、computed、useMessage 等），
//      类型声明生成于 auto-imports.d.ts（自动生成，勿手改）
//   2. unplugin-vue-components —— Naive UI 组件按需自动注册，
//      类型声明生成于 components.d.ts（自动生成，勿手改）
//   3. 路径别名：@ -> src，# -> public，$ -> src/components
//   4. 构建不压缩 CSS（cssMinify: false），便于调试毛玻璃主题
// https://vite.dev/config/
// ============================================================

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    // 自动注入的 API 列表（新增依赖时在此登记）
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        },
        {
          'axios': [
            'axios'
          ]
        }
      ]
    }),
    // Naive UI 组件按需解析（模板中的 n-* 组件无需手动 import）
    Components({
      resolvers: [
        NaiveUiResolver(),
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '#': resolve(__dirname, 'public'),
      '$': resolve(__dirname, 'src/components')
    }
  },
  publicDir: 'public',
  build: {
    cssMinify: false
  }
})
