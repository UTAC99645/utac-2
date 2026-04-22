// 引入 Vue 核心函数，用于创建应用实例
import { createApp } from 'vue';
// 引入根组件
import main from './main.vue';
// 引入全局样式文件
import './main.css';
// 引入路由相关样式
import './router.css';
// 引入 Vue Router 相关函数
import { createRouter, createWebHistory } from 'vue-router';

// 创建路由实例，使用 history 模式
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',           // 首页路径
      name: 'Home',        // 路由名称
      component: () => import('$/home.vue')  // 懒加载首页组件
    },
    {
      path: '/about',      // 关于页面路径
      name: 'About',       // 路由名称
      component: () => import('$/about.vue') // 懒加载关于组件
    },
  ]
});

// 创建 Vue 应用实例，使用路由并挂载到 DOM
// 挂载点 ID 为 #main
createApp(main)
  .use(router)
  .mount('#main');
