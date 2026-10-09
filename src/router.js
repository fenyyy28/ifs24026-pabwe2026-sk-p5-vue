import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from './helpers/apiHelper'
import LoginPage from './features/auth/pages/LoginPage.vue'
import RegisterPage from './features/auth/pages/RegisterPage.vue'
import AucationLayout from './features/aucations/layouts/AucationLayout.vue'
import HomePage from './features/aucations/pages/HomePage.vue'
import DetailPage from './features/aucations/pages/DetailPage.vue'
import UsersPage from './features/users/pages/UsersPage.vue'
import ProfilePage from './features/users/pages/ProfilePage.vue'
import NotFoundPage from './features/common/pages/NotFoundPage.vue'

export const routes = [
  {
    path: '/auth',
    redirect: '/auth/login',
    meta: { guestOnly: true },
    children: [
      { path: 'login', name: 'login', component: LoginPage },
      { path: 'register', name: 'register', component: RegisterPage },
    ],
  },
  {
    path: '/',
    component: AucationLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: HomePage },
      {
        path: 'my',
        name: 'my-aucations',
        component: HomePage,
        props: { initialTab: 'mine' },
      },
      {
        path: 'aucations/:aucationId',
        name: 'aucation-detail',
        component: DetailPage,
      },
      { path: 'users', name: 'users', component: UsersPage },
      { path: 'profile', name: 'profile', component: ProfilePage },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

/**
 * Penjaga rute berdasarkan token di localStorage:
 * - halaman terproteksi butuh token, jika tidak diarahkan ke login
 * - halaman tamu (login/register) tidak untuk yang sudah login
 */
export function authGuard(to) {
  const isLoggedIn = Boolean(getAccessToken())

  if (to.meta.requiresAuth && !isLoggedIn) return '/auth/login'
  if (to.meta.guestOnly && isLoggedIn) return '/'
  return true
}

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })
  router.beforeEach(authGuard)
  return router
}

export default createAppRouter()