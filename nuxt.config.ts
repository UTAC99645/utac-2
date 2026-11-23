// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2026-08-05",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css", "~/assets/css/naive-ui-glass.css"],

  // 0. 引擎配置的运行时校验与全局状态已收敛到 composables/useEngines.ts
  //    （取代旧的 composables/auto.mach.ts 本地模块，无需再注册 modules）

  // 1. CSS 不压缩（透传给底层 Vite 的构建配置）
  vite: {
    build: {
      cssMinify: false
    }
  },

  // 2. 自动导入 naive-ui 的 API
  //    (vue / vue-router / Nuxt API 已内置，无需声明)
  imports: {
    presets: [
      {
        from: "naive-ui",
        imports: ["useDialog", "useMessage", "useNotification", "useLoadingBar"]
      }
    ]
  },

  // 3. SSR 保持开启（与现状一致）；
  //    transpile 让打包时对 naive-ui / vueuc / @css-render/vue3-ssr
  //    做依赖转译，保证组件样式正确注入与兼容
  ssr: true,
  build: {
    transpile: ["naive-ui", "vueuc", "@css-render/vue3-ssr"]
  },

  // 4. 组件目录注册（Nuxt 默认扫描 ~/components，
  //    含 FileViewer.vue、SearchQrPanel.vue、HitokotoCard.vue
  //    与 FileViewer/renderers/ 下的渲染器子组件）
  components: [
    {
      path: "~/components",
    }
  ]
});
