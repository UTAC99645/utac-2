import { createApp } from 'vue';
import main from './main.vue';
import './main.css';
import './router.css';
import { createRouter, createWebHistory } from 'vue-router';

// 核心优化：静态导入→动态导入
const Home = () => import('./components/home.vue');
const About = () => import('./components/about.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});

createApp(main)
  .use(router)
  .mount('#main');

