import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface ApiKey {
  id: number;
  userId: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  permissions: string[];
  status: 'active' | 'revoked';
}

interface ApiError {
  message: string;
  code?: string;
}

export const useApiKeyStore = defineStore('apikeys', () => {
  const apiKeys = ref<ApiKey[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  const fetchApiKeys = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{apiKeys: ApiKey[]}>('https://api.green-sys.es/apikeys', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      apiKeys.value = response.data.apiKeys
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar las API keys.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar las API keys.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const createApiKey = async (name: string, permissions: string[]): Promise<{success: boolean, key?: string}> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{apiKey: ApiKey}>('https://api.green-sys.es/apikeys', {
        name,
        permissions
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      apiKeys.value.push(response.data.apiKey)
      return { success: true, key: response.data.apiKey.key }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al crear la API key.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al crear la API key.' }
      }
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const revokeApiKey = async (id: number): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.delete(`https://api.green-sys.es/apikeys/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      const keyIndex = apiKeys.value.findIndex(key => key.id === id)
      if (keyIndex !== -1) {
        apiKeys.value[keyIndex].status = 'revoked'
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al revocar la API key.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al revocar la API key.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    apiKeys,
    isLoading,
    lastError,
    fetchApiKeys,
    createApiKey,
    revokeApiKey
  }
}) 