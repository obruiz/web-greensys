<script setup lang="ts">
import { ref } from 'vue'
import { useApiKeyStore } from '../stores/apikeys'
import toastr from '../toastrConfig'

const apiKeyStore = useApiKeyStore()
const showCreateForm = ref(false)
const newKeyName = ref('')
const selectedPermissions = ref<string[]>([])

const availablePermissions = [
  { value: 'read', label: 'Lectura' },
  { value: 'write', label: 'Escritura' },
  { value: 'delete', label: 'Eliminación' }
]

const handleCreate = async () => {
  if (!newKeyName.value) {
    toastr.error('Por favor, ingresa un nombre para la API key')
    return
  }

  if (selectedPermissions.value.length === 0) {
    toastr.error('Por favor, selecciona al menos un permiso')
    return
  }

  const result = await apiKeyStore.createApiKey(newKeyName.value, selectedPermissions.value)
  
  if (result.success) {
    toastr.success('API key creada correctamente')
    // Mostrar la key al usuario
    if (result.key) {
      toastr.info(`Tu API key es: ${result.key}. Guárdala en un lugar seguro, no podrás verla de nuevo.`)
    }
    // Resetear el formulario
    newKeyName.value = ''
    selectedPermissions.value = []
    showCreateForm.value = false
  } else if (apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}

const handleRevoke = async (id: number) => {
  const success = await apiKeyStore.revokeApiKey(id)
  
  if (success) {
    toastr.success('API key revocada correctamente')
  } else if (apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-medium text-gray-900">API Keys</h3>
        <p class="mt-1 text-sm text-gray-500">
          Gestiona tus API keys para integrar GreenSys con tus aplicaciones.
        </p>
      </div>
      <button 
        @click="showCreateForm = true"
        class="btn-primary"
        :disabled="apiKeyStore.isLoading"
      >
        Nueva API Key
      </button>
    </div>

    <!-- Lista de API Keys -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permisos</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último uso</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="apiKeyStore.isLoading">
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                Cargando API keys...
              </td>
            </tr>
          </template>
          <template v-else-if="apiKeyStore.apiKeys.length === 0">
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                No hay API keys para mostrar
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="key in apiKeyStore.apiKeys" :key="key.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ key.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="permission in key.permissions" 
                    :key="permission"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
                  >
                    {{ permission }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    key.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  ]"
                >
                  {{ key.status === 'active' ? 'Activa' : 'Revocada' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Nunca' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button 
                  v-if="key.status === 'active'"
                  @click="handleRevoke(key.id)"
                  class="text-red-600 hover:text-red-900"
                  :disabled="apiKeyStore.isLoading"
                >
                  Revocar
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Modal de creación -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Nueva API Key</h2>
          <button 
            @click="showCreateForm = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              v-model="newKeyName" 
              type="text" 
              class="input-field" 
              required 
              :disabled="apiKeyStore.isLoading"
              placeholder="ej. API Producción"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
            <div class="space-y-2">
              <div 
                v-for="permission in availablePermissions" 
                :key="permission.value"
                class="flex items-center"
              >
                <input 
                  :id="permission.value"
                  type="checkbox"
                  :value="permission.value"
                  v-model="selectedPermissions"
                  class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  :disabled="apiKeyStore.isLoading"
                />
                <label 
                  :for="permission.value"
                  class="ml-2 block text-sm text-gray-900"
                >
                  {{ permission.label }}
                </label>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              class="btn-secondary"
              @click="showCreateForm = false"
              :disabled="apiKeyStore.isLoading"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="apiKeyStore.isLoading"
            >
              {{ apiKeyStore.isLoading ? 'Creando...' : 'Crear API Key' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed;
}
</style> 