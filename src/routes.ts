import { createRouter, createWebHistory } from 'vue-router';

import Feed from './views/Feed.vue';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Faq from './views/Faq.vue';

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/faq',
      name: 'faq',
      component: Faq,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/feed',
      name: 'feed',
      component: Feed,
    },
    { path: '/:pathMatch(.*)*', redirect: '/home' },
  ],
});

export default router;
