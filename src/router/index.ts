import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminPanel.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/client',
      name: 'client',
      component: () => import('../views/ClientPanel.vue'),
      meta: { requiresAuth: true, requiresClient: true }
    },
    // Redirecciones
    {
      path: '/dashboard',
      redirect: to => {
        const authStore = useAuthStore()
        return authStore.user?.role === 'admin' ? '/admin' : '/client'
      },
      meta: { requiresAuth: true }
    },
    // Ruta 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue')
    }
  ]
})

// Guardia de navegación global
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }

  // Verificar si la ruta requiere ser invitado (no autenticado)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return {
      name: 'dashboard'
    }
  }

  // Verificar si la ruta requiere rol de administrador
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return {
      name: 'not-found'
    }
  }

  // Verificar si la ruta requiere rol de cliente
  if (to.meta.requiresClient && authStore.user?.role !== 'client') {
    return {
      name: 'not-found'
    }
  }
})

export default router 