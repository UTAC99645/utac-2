import { createApp } from 'vue';
import main from './main.vue';
import './main.css';
import './router.css';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/home.vue';
import About from './components/about.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});

createApp(main)
  .use(router)
  .use(DevUI)
  .mount('#main');
