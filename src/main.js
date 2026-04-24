// ============================================================
// 应用入口文件
// 职责：创建 Vue 应用实例、配置路由、挂载到 DOM
// ============================================================

// ---------- Vue 核心 ----------
import { createApp } from 'vue';

// ---------- 根组件 ----------
import main from './main.vue';
import typeMap_src from './addition/searchWay.json'

// ---------- 全局样式 ----------
import './css/main.css';
import './css/router.css';

// ---------- Vue Router ----------
import { createRouter, createWebHistory } from 'vue-router';

// ============================================================
// 路由配置
// ============================================================

const typeArr = computed(() => {
  let a = ""
  let first = true
  for (let [item] of typeMap_src) {
    a += first ? `${item}` : `|${item}`
    first = false
  }
  a += "|"
  return a
})

console.log(typeArr.value)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: `/:type(${typeArr.value})?`,                        // 首页（可选 type 参数）
      name: 'Home',
      component: () => import('$/home.vue')  // 懒加载
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('$/about.vue') // 懒加载
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('$/404.vue')   // 懒加载 404 页
    }
  ]
});

// ============================================================
// 挂载应用
// 挂载点：index.html 中的 #main
// ============================================================

createApp(main)
  .use(router)
  .mount('#main');
