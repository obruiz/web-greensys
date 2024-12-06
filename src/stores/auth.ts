import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  username: string
  role: 'admin' | 'client'
  status: 'active' | 'inactive'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    logout
  }
}) 