import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginPage.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('../views/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/students' },
      {
        path: 'students',
        name: 'students',
        component: () => import('../views/students/StudentsPage.vue'),
        meta: { title: '学生管理' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/reports/ReportsPage.vue'),
        meta: { title: '统计报表' },
      },
      {
        path: 'learn',
        name: 'learn',
        component: () => import('../views/learn/LearnPage.vue'),
        meta: { title: '学习资源' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.path === '/login') return true
  if (to.meta?.requiresAuth && !auth.isAuthed) return { path: '/login', replace: true }
  return true
})

router.afterEach((to) => {
  const title = (to.meta?.title as string | undefined) ?? '学生管理系统'
  document.title = title
})

export default router
