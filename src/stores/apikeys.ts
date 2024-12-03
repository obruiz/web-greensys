import { defineStore } from 'pinia'
import { ref } from 'vue'

interface ApiKey {
  id: string;
  userId: string;
  key: string;
  name: string;
  createdAt: Date;
  lastUsed?: Date;
}

export const useApiKeyStore = defineStore('apikeys', () => {
  const apiKeys = ref<ApiKey[]>([])

  function generateApiKey(userId: string, name: string): ApiKey {
    const key = 'sk_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    const newApiKey: ApiKey = {
      id: Math.random().toString(36).substring(7),
      userId,
      key,
      name,
      createdAt: new Date()
    }
    apiKeys.value.push(newApiKey)
    return newApiKey
  }

  function deleteApiKey(id: string) {
    const index = apiKeys.value.findIndex(key => key.id === id)
    if (index !== -1) {
      apiKeys.value.splice(index, 1)
    }
  }

  function getUserApiKeys(userId: string) {
    return apiKeys.value.filter(key => key.userId === userId)
  }

  return {
    apiKeys,
    generateApiKey,
    deleteApiKey,
    getUserApiKeys
  }
}) 