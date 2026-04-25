// ============================================================
// 应用入口文件
// 职责：创建 Vue 应用实例、配置路由、挂载到 DOM
// ============================================================

// ---------- Vue 核心 ----------
import { createApp, ref, computed } from 'vue';

// ---------- Vue Router ----------
import { createRouter, createWebHistory } from 'vue-router';

// ---------- 根组件 ----------
import main from './main.vue';

// ---------- 全局样式 ----------
import './css/main.css';
import './css/router.css';

// ---------- 搜索引擎配置数据 ----------
import typeMap_src from './addition/searchWay.json';
import keyMap_src  from './addition/searchKey.json';

// ============================================================
// 路由动态参数构建
// 根据 JSON 配置自动生成路由参数正则，实现动态引擎匹配
// ============================================================

const fullMap_src = ref([...typeMap_src, ...keyMap_src]);

const typeArr = computed(() => {
  let a = '';
  let first = true;
  for (let [item] of fullMap_src.value) {
    a += first ? `${item}` : `|${item}`;
    first = false;
  }
  a += '|';
  return a;
});

console.log(typeArr.value);

// ============================================================
// 路由配置
// ============================================================

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: `/:type(${typeArr.value})?`,          // 首页（动态匹配搜索引擎类型）
      name: 'Home',
      component: () => import('$/home.vue')       // 懒加载
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('$/about.vue')      // 懒加载
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: () => import('$/404.vue')         // 懒加载 404 页
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
