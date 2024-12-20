<script setup lang="ts">
import { ref } from 'vue'
import { useTicketStore } from '../stores/tickets'
import toastr from '../toastrConfig'

const ticketStore = useTicketStore()

const formData = ref({
  title: '',
  description: '',
  category: '',
  priority: 'low' as 'low' | 'medium' | 'high'
})

const emit = defineEmits(['close'])

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.description || !formData.value.category) {
    toastr.error('Por favor, completa todos los campos')
    return
  }

  const success = await ticketStore.createTicket(formData.value)
  
  if (success) {
    toastr.success('Ticket creado correctamente')
    emit('close')
  } else if (ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Nuevo Ticket</h2>
        <button 
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-500"
        >
          <span class="sr-only">Cerrar</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input 
            v-model="formData.title" 
            type="text" 
            class="input-field" 
            required 
            :disabled="ticketStore.isLoading"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            v-model="formData.description" 
            rows="4" 
            class="input-field" 
            required 
            :disabled="ticketStore.isLoading"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select 
            v-model="formData.category" 
            class="input-field" 
            required 
            :disabled="ticketStore.isLoading"
          >
            <option value="">Selecciona una categoría</option>
            <option value="technical">Soporte Técnico</option>
            <option value="billing">Facturación</option>
            <option value="account">Cuenta</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select 
            v-model="formData.priority" 
            class="input-field" 
            required 
            :disabled="ticketStore.isLoading"
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3">
          <button 
            type="button" 
            class="btn-secondary"
            @click="$emit('close')"
            :disabled="ticketStore.isLoading"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="ticketStore.isLoading"
          >
            {{ ticketStore.isLoading ? 'Creando...' : 'Crear Ticket' }}
          </button>
        </div>
      </form>
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