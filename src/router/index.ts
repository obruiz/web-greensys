import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import AdminPanel from '../views/AdminPanel.vue'
import ClientPanel from '../views/ClientPanel.vue'
import Payment from '../views/Payment.vue'
import Tpv from '../views/Tpv.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'
import NotFound from '../views/NotFound.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanel,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/client',
      name: 'client',
      component: ClientPanel,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment',
      name: 'payment',
      component: Payment,
      meta: { requiresAuth: true }
    },
    {
      path: '/doc',
      name: 'documentation',
      component: () => import('../views/Documentation.vue')
    },
    {
      path: '/tpv/:slug?',
      name: 'tpv',
      component: Tpv,
      props: true
    },
    {
      path: '/payment-success',
      name: 'payment-success',
      component: PaymentSuccess
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/client')
  } else {
    next()
  }
})

export default router