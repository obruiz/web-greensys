<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApiKeyStore } from '../stores/apikeys'
import toastr from '../toastrConfig'

const apiKeyStore = useApiKeyStore()
const newKeyName = ref('')
const showNewKey = ref<string | null>(null)
const selectedKey = ref<string | null>(null)
const showKeyModal = ref(false)
const showDeleteModal = ref(false)
const keyToDelete = ref<{id: number, name: string} | null>(null)

onMounted(async () => {
  await loadApiKeys()
})

async function loadApiKeys() {
  const success = await apiKeyStore.fetchApiKeys()
  if (!success && apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}

async function handleCreateKey() {
  if (!newKeyName.value.trim()) {
    toastr.error('El nombre de la API Key es requerido')
    return
  }

  const newKey = await apiKeyStore.createApiKey(newKeyName.value)
  if (newKey) {
    showNewKey.value = newKey.key
    toastr.success('API Key creada exitosamente')
    newKeyName.value = ''
    await loadApiKeys()
  } else if (apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}

function handleShowKey(key: string) {
  selectedKey.value = key
  showKeyModal.value = true
}

async function copyToClipboard(text: string) {
  if (!text) return

  try {
    // Primero intentamos usar el API moderno
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      toastr.success('API Key copiada al portapapeles')
      return
    }

    // Fallback para navegadores que no soportan el API o contextos no seguros
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      toastr.success('API Key copiada al portapapeles')
    } catch (err) {
      toastr.error('Error al copiar. Por favor, copia manualmente el texto')
    } finally {
      textArea.remove()
    }
  } catch (err) {
    console.error('Error al copiar:', err)
    toastr.error('Error al copiar. Por favor, copia manualmente el texto')
  }
}

const formatDate = (date: string | null) => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error al formatear la fecha:', error)
    return 'Fecha no disponible'
  }
}

function handleDeleteClick(id: number, name: string) {
  keyToDelete.value = { id, name }
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!keyToDelete.value) return

  const success = await apiKeyStore.deleteApiKey(keyToDelete.value.id)
  if (success) {
    toastr.success('API Key eliminada exitosamente')
    showDeleteModal.value = false
    keyToDelete.value = null
  } else if (apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}
</script>

<template>
  <div>
    <!-- Formulario para crear nueva API Key -->
    <div class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Crear Nueva API Key</h3>
      <div class="space-y-4">
        <div>
          <label for="keyName" class="block text-sm font-medium text-gray-700">Nombre</label>
          <input 
            id="keyName"
            v-model="newKeyName"
            type="text"
            class="input-field mt-1"
            placeholder="ej. Integración con ERP"
            :disabled="apiKeyStore.isLoading"
          />
        </div>
        <button 
          @click="handleCreateKey"
          class="btn-primary w-full"
          :disabled="apiKeyStore.isLoading"
        >
          {{ apiKeyStore.isLoading ? 'Creando...' : 'Crear API Key' }}
        </button>
      </div>

      <!-- Mostrar nueva API Key -->
      <div v-if="showNewKey" class="mt-4 p-4 bg-yellow-50 rounded-lg">
        <div class="flex items-start">
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800">
              ¡Guarda esta API Key! No podrás verla de nuevo.
            </p>
            <div class="mt-2 font-mono text-sm text-yellow-700 break-all">
              {{ showNewKey }}
            </div>
          </div>
          <button 
            @click="showNewKey = null"
            class="ml-4 text-yellow-500 hover:text-yellow-600"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de API Keys -->
    <div class="card">
      <h3 class="text-lg font-medium text-gray-900 mb-4">API Keys Existentes</h3>
      
      <!-- Loading skeleton -->
      <div v-if="apiKeyStore.isLoading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      <!-- No hay API Keys -->
      <div v-else-if="apiKeyStore.apiKeys.length === 0" 
           class="text-center py-8 text-gray-500">
        <p>No hay API Keys creadas.</p>
        <p class="text-sm mt-2">Crea una API Key para integrar servicios externos.</p>
      </div>

      <!-- Lista de API Keys -->
      <div v-else class="space-y-4">
        <div v-for="key in apiKeyStore.apiKeys" 
             :key="key.id"
             class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <div class="font-medium text-gray-900">{{ key.name }}</div>
            <div class="text-sm text-gray-600">
              Creada el {{ formatDate(key.createdAt) }}
              <span v-if="key.lastUsed" class="mx-1">•</span>
              <span v-if="key.lastUsed">
                Último uso: {{ formatDate(key.lastUsed) }}
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button 
              @click="handleShowKey(key.key)"
              class="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              :disabled="apiKeyStore.isLoading"
            >
              Ver Key
            </button>
            <button 
              @click="handleDeleteClick(key.id, key.name)"
              class="text-red-600 hover:text-red-700 text-sm font-medium"
              :disabled="apiKeyStore.isLoading"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar API Key -->
    <div v-if="showKeyModal" 
         class="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">API Key</h3>
          <button 
            @click="showKeyModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="font-mono text-sm break-all mb-2">
            {{ selectedKey }}
          </div>
          <button 
            @click="copyToClipboard(selectedKey || '')"
            class="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center mt-2"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copiar al portapapeles
          </button>
        </div>

        <div class="mt-4 flex justify-end">
          <button 
            @click="showKeyModal = false"
            class="btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" 
         class="fixed top-0 left-0 right-0 bottom-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Confirmar eliminación</h3>
          <button 
            @click="showDeleteModal = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar la API Key "{{ keyToDelete?.name }}"? Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="btn-secondary"
            :disabled="apiKeyStore.isLoading"
          >
            Cancelar
          </button>
          <button 
            @click="confirmDelete"
            class="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500"
            :disabled="apiKeyStore.isLoading"
          >
            {{ apiKeyStore.isLoading ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 