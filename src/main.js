import { createApp } from 'vue';
import main from './main.vue';
import './main.css';
import './router.css';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/home.vue';
import About from './components/about.vue';

import DevUI from 'vue-devui';
import 'vue-devui/style.css';
import '@devui-design/icons/icomoon/devui-icon.css';
import { ThemeServiceInit, deepTheme } from 'devui-theme';
ThemeServiceInit({ deepTheme }, 'deepTheme');

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