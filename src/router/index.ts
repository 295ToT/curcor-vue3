import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { i18n } from '../i18n'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/LoginPage.vue'),
    meta: { titleKey: 'route.login' },
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
        meta: { titleKey: 'route.students' },
      },
      {
        path: 'teachers',
        name: 'teachers',
        component: () => import('../views/teachers/TeachersPage.vue'),
        meta: { titleKey: 'route.teachers' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('../views/reports/ReportsPage.vue'),
        meta: { titleKey: 'route.reports' },
      },
      {
        path: 'learn',
        name: 'learn',
        component: () => import('../views/learn/LearnPage.vue'),
        meta: { titleKey: 'route.learn' },
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
  const key = to.meta?.titleKey as string | undefined
  const { t } = i18n.global
  const page = key ? String(t(key)) : String(t('app.title'))
  document.title = `${page} · ${String(t('app.title'))}`
})

export default router
