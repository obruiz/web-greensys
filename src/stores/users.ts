import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface User {
  id: string
  username: string
  role: 'admin' | 'client'
  status: 'pending' | 'active' | 'inactive'
  sandboxMode: boolean
  email: string
  phone: string
  businessName: string
  legalName: string
  businessType: string
  website: string
  country: string
  taxId: string
  bankName: string
  iban: string
  swift: string
  createdAt: string
  updatedAt: string
}

interface ApiError {
  message: string
  code?: string
}

interface ApiResponse {
  users: User[]
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  async function fetchUsers(): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<ApiResponse>('https://api.green-sys.es/users', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      users.value = response.data.users
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else if (error.response?.status === 403) {
          lastError.value = { message: 'No tiene permisos para realizar esta acción.' }
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar los usuarios.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar los usuarios.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateUserStatus(username: string, status: 'pending' | 'active' | 'inactive'): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.put(`https://api.green-sys.es/users/${username}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      // Actualizar el estado del usuario en la lista local
      const userIndex = users.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        users.value[userIndex].status = status
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else if (error.response?.status === 403) {
          lastError.value = { message: 'No tiene permisos para realizar esta acción.' }
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al actualizar el estado del usuario.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al actualizar el estado del usuario.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    isLoading,
    lastError,
    fetchUsers,
    updateUserStatus
  }
}) 