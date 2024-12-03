<script setup lang="ts">
import { ref } from 'vue'
import { useApiKeyStore } from '../stores/apikeys'
import { useAuthStore } from '../stores/auth'

const apiKeyStore = useApiKeyStore()
const authStore = useAuthStore()
const newKeyName = ref('')
const showNewKey = ref('')

const createNewKey = () => {
  if (authStore.user && newKeyName.value) {
    const apiKey = apiKeyStore.generateApiKey(authStore.user.username, newKeyName.value)
    showNewKey.value = apiKey.key
    newKeyName.value = ''
  }
}

const handleDelete = (keyId: string) => {
  apiKeyStore.deleteApiKey(keyId)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-medium text-gray-900">API Keys</h3>
      <button class="btn-primary" @click="showNewKey = ''">Nueva API Key</button>
    </div>

    <div v-if="showNewKey" class="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
      <div class="text-sm text-emerald-800 mb-2">
        Guarda esta API key en un lugar seguro. No podrás verla de nuevo.
      </div>
      <code class="block p-2 bg-white rounded border border-emerald-200">
        {{ showNewKey }}
      </code>
    </div>

    <form v-else @submit.prevent="createNewKey" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la API Key</label>
        <input v-model="newKeyName" type="text" class="input-field" required />
      </div>
      <button type="submit" class="btn-primary w-full">Generar API Key</button>
    </form>

    <div class="space-y-4">
      <div v-for="key in apiKeyStore.getUserApiKeys(authStore.user?.username || '')" 
           :key="key.id"
           class="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <div class="font-medium text-gray-900">{{ key.name }}</div>
          <div class="text-sm text-gray-600">
            Creada el {{ new Date(key.createdAt).toLocaleDateString() }}
          </div>
        </div>
        <button @click="handleDelete(key.id)" 
                class="text-red-600 hover:text-red-700">
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template> 