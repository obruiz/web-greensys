<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  ticketId: number
}>()

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const newResponse = ref('')

const ticket = computed(() => 
  ticketStore.tickets.find(t => t.id === props.ticketId)
)

const statusOptions = [
  { value: 'open', label: 'Abierto' },
  { value: 'in-progress', label: 'En Proceso' },
  { value: 'resolved', label: 'Resuelto' }
]

const handleStatusChange = (status: 'open' | 'in-progress' | 'resolved') => {
  ticketStore.updateTicketStatus(props.ticketId, status)
}

const handleResponse = () => {
  if (newResponse.value.trim() && authStore.user) {
    ticketStore.addResponse(
      props.ticketId,
      authStore.user.username,
      newResponse.value
    )
    newResponse.value = ''
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'open': return 'bg-blue-50 text-blue-700'
    case 'in-progress': return 'bg-yellow-50 text-yellow-700'
    case 'resolved': return 'bg-emerald-50 text-emerald-700'
    default: return 'bg-gray-50 text-gray-700'
  }
}
</script>

<template>
  <div v-if="ticket" class="space-y-6">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-xl font-bold text-gray-900">{{ ticket.title }}</h3>
        <p class="text-sm text-gray-600">
          Ticket #{{ ticket.id }} • Creado el {{ new Date(ticket.createdAt).toLocaleDateString() }}
        </p>
      </div>
      <div v-if="authStore.isAdmin" class="flex items-center space-x-2">
        <label class="text-sm text-gray-600">Estado:</label>
        <select 
          :value="ticket.status"
          @change="e => handleStatusChange(e.target.value)"
          class="input-field py-1"
        >
          <option 
            v-for="option in statusOptions" 
            :key="option.value" 
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
      <span 
        v-else 
        :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(ticket.status)]"
      >
        {{ ticket.status }}
      </span>
    </div>

    <div class="bg-gray-50 p-4 rounded-lg">
      <p class="text-gray-700">{{ ticket.description }}</p>
    </div>

    <div class="space-y-4">
      <h4 class="font-medium text-gray-900">Historial de Respuestas</h4>
      <div class="space-y-4">
        <div 
          v-for="response in ticket.responses" 
          :key="response.id"
          class="bg-white p-4 rounded-lg border"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-medium text-gray-900">{{ response.userId }}</span>
            <span class="text-sm text-gray-600">
              {{ new Date(response.createdAt).toLocaleString() }}
            </span>
          </div>
          <p class="text-gray-700">{{ response.message }}</p>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Agregar Respuesta</label>
      <textarea 
        v-model="newResponse"
        rows="3"
        class="input-field"
        placeholder="Escribe tu respuesta..."
      ></textarea>
      <button @click="handleResponse" class="btn-primary">
        Enviar Respuesta
      </button>
    </div>
  </div>
</template> 