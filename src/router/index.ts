import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'records',
      component: () => import('@/views/RecordsView.vue'),
      meta: { title: '我的记录' },
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
      meta: { title: '统计分析' },
    },
    {
      path: '/inspiration',
      name: 'inspiration',
      component: () => import('@/views/InspirationView.vue'),
      meta: { title: '灵感库' },
    },
  ],
})

export default router
