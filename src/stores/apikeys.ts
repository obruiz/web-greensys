import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface ApiKey {
  id: number
  name: string
  key: string
  createdAt: string
  lastUsed: string | null
}

interface ApiError {
  message: string
  code?: string
}

interface CreateApiKeyResponse {
  apiKey: ApiKey
}

export const useApiKeyStore = defineStore('apikeys', () => {
  const apiKeys = ref<ApiKey[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  async function fetchApiKeys(): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{apiKeys: ApiKey[]}>('https://api.green-sys.es/apikeys', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      apiKeys.value = response.data.apiKeys?.map(key => ({
        ...key,
        createdAt: new Date(key.createdAt).toISOString(),
        lastUsed: key.lastUsed ? new Date(key.lastUsed).toISOString() : null
      })) || []
      
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar las API Keys.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar las API Keys.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function createApiKey(name: string): Promise<ApiKey | null> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<CreateApiKeyResponse>('https://api.green-sys.es/apikeys', 
        { name },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      const newApiKey = response.data.apiKey
      apiKeys.value.push(newApiKey)
      return newApiKey
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al crear la API Key.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al crear la API Key.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteApiKey(id: number): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.delete(`https://api.green-sys.es/apikeys/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      // Eliminar la API Key de la lista local
      apiKeys.value = apiKeys.value.filter(k => k.id !== id)

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al eliminar la API Key.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al eliminar la API Key.' }
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
    deleteApiKey
  }
}) 