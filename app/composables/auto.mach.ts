// ============================================================
// searchEngineTypes 全局注入模块（Nuxt Module）
// 职责：
//   将 composables/mach.ts 的命名导出 searchEngineTypes
//   （引擎名 "|" 拼接的 computed ref）注册为全局自动导入，
//   使页面中可直接使用 searchEngineTypes 而无需手动 import。
//   背景：Nuxt 的 composables 自动导入仅覆盖命名导出，
//         原 Vite 时代的 default-export + 手动导入方式迁移后
//         不再优雅，故以模块形式显式注册。
// 注册于：nuxt.config.ts 的 modules 数组
// 消费方：pages/index.vue 的 checkUrl()（校验 URL query 的 type 参数）
// ============================================================
import { defineNuxtModule, addImports } from "nuxt/kit";
import { fileURLToPath } from "node:url";

export default defineNuxtModule({
  meta: {
    name: "search-engine-types",
    version: "1.0.0"
  },
  setup() {
    // 把 mach.ts 的命名导出注册为全局标识符（同名，省略 as）
    // from 使用绝对路径解析，指向同目录下的 mach.ts，运行时逻辑保留在原文件
    addImports({
      name: "searchEngineTypes",
      from: fileURLToPath(new URL("./mach.ts", import.meta.url))
    });
  }
});
