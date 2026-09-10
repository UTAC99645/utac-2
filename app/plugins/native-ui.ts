/**
 * Naive UI 注册插件
 * 职责：将 naive-ui 组件库安装到 Nuxt 应用（nuxtApp.vueApp.use(naive)）
 * 说明：
 *   1. 安装后模板中可直接使用 n-* 组件，无需逐个导入
 *   2. 组合式 API（useMessage / useDialog / useNotification / useLoadingBar）
 *      由 nuxt.config.ts 的 imports.presets 自动导入
 */
import naive from 'naive-ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(naive)
})

