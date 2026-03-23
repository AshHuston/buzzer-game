import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/BuzzerView.vue'),
    },
    {
      path: '/hub',
      name: 'hub',
      component: () => import('../views/HubView.vue'),
    },
  ],
})

export default router
