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
      path: '/host',
      name: 'host',
      component: () => import('../views/HubView.vue'),
    },
    {
      path: '/gameboard',
      name: 'gameboard',
      component: () => import('../views/GameboardView.vue'),
    },
    {
      path: '/panel',
      name: 'control-panel',
      component: () => import('../views/ControlPanelView.vue'),
    }
  ],
})

export default router
