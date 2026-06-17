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
      meta: { title: '淘书统计' },
    },
    {
      path: '/inspiration',
      name: 'inspiration',
      component: () => import('@/views/InspirationView.vue'),
      meta: { title: '灵感库' },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
      meta: { title: '心愿单' },
    },
    {
      path: '/monthly-review',
      name: 'monthly-review',
      component: () => import('@/views/MonthlyReviewView.vue'),
      meta: { title: '月度购书回顾' },
    },
  ],
})

export default router
