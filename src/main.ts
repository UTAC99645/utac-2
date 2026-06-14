// ============================================================
// 应用入口文件
// 职责：创建 Vue 应用实例、配置路由、挂载到 DOM
// ============================================================

// ---------- Vue 核心 ----------
import { createApp, ref, computed } from "vue";

// ---------- Vue Router ----------
import { createRouter, createWebHistory, useRoute, RouteRecordRaw } from "vue-router";
import { EngineConfig } from "./ts/type";
const route = useRoute();

// ---------- 根组件 ----------
import main from "./main.vue";

// ---------- 全局样式 ----------
import "./css/main.css";
import "./css/router.css";
import "./css/naive-ui-glass.css";

import "./axios"

// ---------- 搜索引擎配置数据 ----------
import typeMap_Rsrc from "./addition/searchWay.json";
import keyMap_Rsrc from "./addition/searchKey.json";

const typeMap_src = typeMap_Rsrc as [string, EngineConfig][]
const keyMap_src = keyMap_Rsrc as [string, EngineConfig][]

// ============================================================
// 路由动态参数构建
// 根据 JSON 配置自动生成路由参数正则，实现动态引擎匹配
// ============================================================

const fullMap_src = ref<[string, EngineConfig][]>([...typeMap_src, ...keyMap_src]);

const typeArr = computed<string>(() => {
  let rs: string
  let key: any[] = fullMap_src.value.map(item => item[0])
  rs = key.join("|");
  return rs;
});

// ============================================================
// 路由配置
// ============================================================

const routes: RouteRecordRaw[] = [
  {
    path: `/:type(${typeArr.value})?`, // 首页（动态匹配搜索引擎类型）
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
// 挂载应用
// 挂载点：index.html 中的 #main
// ============================================================

createApp(main).use(router).mount("#main");
