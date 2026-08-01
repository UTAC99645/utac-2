// ============================================================
// 应用入口
// 职责：
//   1. 创建 Vue 应用实例并挂载到 index.html 的 #main
//   2. 注册 Axios 全局拦截器（副作用引入，见 axios.ts）
//   3. 创建 Vue Router：路由表 + 页面标题同步守卫
// 约定：
//   ref / computed / useMessage 等常用 API 由 unplugin-auto-import
//   自动注入，无需显式 import（配置见 vite.config.ts）
// ============================================================

// ---------- Vue 核心 ----------
import { createApp } from "vue";

// ---------- Vue Router ----------
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// ---------- 根组件 ----------
import main from "./main.vue";

// ---------- 全局样式（引入顺序即样式级联顺序，请勿随意调整） ----------
import "./css/main.css";
import "./css/router.css";
import "./css/naive-ui-glass.css";

// ---------- Axios 拦截器（为每个响应附加耗时，见 axios.ts） ----------
import "./axios.ts"

// ---------- 引擎名集合（约束路由 type 参数的取值，见 addition/mach.ts） ----------
import searchEngineTypes from "./addition/mach.ts"


// ============================================================
// 路由表
// 首页路径格式：/:type?/:query?
//   - type  ：搜索引擎名，取值受 mach.ts 生成的正则约束（如 /google）
//   - query ：可选搜索词，直接作为路径段（如 /google/hello）
// 所有页面组件均按需懒加载
// ============================================================

const routes: RouteRecordRaw[] = [
  {
    path: `/:type(${searchEngineTypes.value})?/:query(.*)?`, // 首页（type 为受约束的引擎名）
    name: "Home",
    component: () => import("$/home.vue"), // 懒加载
  },
  {
    path: "/about",
    name: "About",
    component: () => import("$/about.vue"), // 懒加载
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("$/404.vue"), // 懒加载 404 页
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ============================================================
// 全局前置守卫：根据路由参数同步页面标题
//   带搜索词 -> "引擎-搜索词"；仅引擎 -> 引擎名
// ============================================================

router.beforeEach((to) => {
  let q = to.params.query
  let t = to.params.type
  document.title = q ? `${t}-${q}` : t as string
})

// ============================================================
// 创建并挂载应用
// 挂载点：index.html 中的 #main
// ============================================================

createApp(main)
  .use(router)
  .mount("#main");
