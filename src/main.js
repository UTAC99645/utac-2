import { createApp } from 'vue';
import main from './main.vue';
import './main.css';
import './router.css';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('$/home.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('$/about.vue')
    },
  ]
});

createApp(main)
  .use(router)
  .mount('#main');

