// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2026-08-05",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css", "~/assets/css/naive-ui-glass.css"],

  // 0. 本地模块：composables/auto.mach.ts
  //    将 composables/mach.ts 的 searchEngineTypes（引擎名正则片段）
  //    注册为全局自动导入，页面可直接使用（详见模块内注释）
  modules: ["~/composables/auto.mach.ts"],

  // 1. CSS 不压缩（透传给底层 Vite 的构建配置）
  vite: {
    build: {
      cssMinify: false
    }
  },

  // 2. 自动导入 naive-ui 和 axios 的 API
  //    (vue / vue-router / Nuxt API 已内置，无需声明)
  imports: {
    presets: [
      {
        from: "naive-ui",
        imports: ["useDialog", "useMessage", "useNotification", "useLoadingBar"]
      },
      {
        from: "axios",
        imports: [["default", "axios"]]
      }
    ]
  },

  // 3. 路径别名（预留配置）
  //    项目不使用 src 目录，实际代码以相对路径导入；
  //    Nuxt 内置的 "~" / "@@/" 别名可直接使用，
  //    此别名仅为保持旧项目习惯而保留（当前无任何代码引用 "@/"）
  alias: {
    "@": "./src"
  },

  // 4. 关闭 SSR，以纯 SPA 模式运行（项目为纯前端应用，无服务端渲染需求）
  //    关闭 SSR 后 Naive UI 无需做服务端样式收集；
  //    保留 transpile 是为了让 Nuxt 在打包时对 naive-ui / vueuc /
  //    @css-render/vue3-ssr 做依赖转译，保证组件样式正确注入与兼容
  ssr: false,
  build: {
    transpile: ["naive-ui", "vueuc", "@css-render/vue3-ssr"]
  },

  // 5. 组件目录注册（Nuxt 默认扫描 ~/components）
  //    pathPrefix: false —— components/Button.vue 可直接以 <Button /> 使用
  //    （当前 ~/components 下仅有 Link.vue（链接预览/万能文件查看器）；
  //      其余 UI 全部来自 naive-ui，由 plugins/native-ui.ts 全局注册）
  components: [
    {
      path: "~/components",
      pathPrefix: false
    }
  ]
});
