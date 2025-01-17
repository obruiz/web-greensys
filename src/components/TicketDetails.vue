<template>
  <div v-if="ticket" class="flex flex-col h-[calc(100vh-8rem)]">
    <!-- Cabecera del ticket -->
    <div class="flex-none bg-white p-4 rounded-t-lg shadow-sm">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ ticket.title }}</h3>
          <p class="text-sm text-gray-600">
            Ticket #{{ ticket.id }} • Creado el {{ formatDate(ticket.createdAt) }}
          </p>
        </div>
        <div v-if="authStore.isAdmin" class="flex items-center space-x-2">
          <label class="text-sm text-gray-600">Estado:</label>
          <select 
            :value="ticket.status"
            @change="handleSelectChange"
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
          {{ getStatusLabel(ticket.status) }}
        </span>
      </div>
    </div>

    <!-- Descripción del ticket -->
    <div class="flex-none bg-gray-50 p-4 shadow-sm">
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span class="text-sm font-medium text-emerald-800">{{ ticket.userId.charAt(0).toUpperCase() }}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ ticket.userId }}</p>
          <p class="text-gray-700 mt-1">{{ ticket.description }}</p>
        </div>
      </div>
    </div>

    <!-- Contenedor de mensajes con scroll -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      <!-- Loading skeleton -->
      <div v-if="ticketStore.isLoading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <div class="bg-white p-4 rounded-lg">
            <div class="flex items-start space-x-3">
              <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de respuestas -->
      <div v-else>
        <div v-if="!ticket.responses?.length" class="text-center py-8">
          <div class="text-gray-400">
            <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="mt-2">No hay respuestas aún</p>
          </div>
        </div>

        <div 
          v-else
          class="space-y-4"
        >
          <div 
            v-for="response in ticket.responses" 
            :key="response.id"
            :class="[
              'flex',
              response.userId === authStore.user?.username ? 'justify-end' : 'justify-start'
            ]"
          >
            <div 
              :class="[
                'max-w-[75%] rounded-lg p-4 shadow-sm',
                response.userId === authStore.user?.username 
                  ? 'bg-emerald-50 ml-4' 
                  : 'bg-white mr-4'
              ]"
            >
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0" v-if="response.userId !== authStore.user?.username">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-800">{{ response.userId.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p 
                      :class="[
                        'text-sm font-medium',
                        response.userId === authStore.user?.username ? 'text-emerald-800' : 'text-gray-900'
                      ]"
                    >
                      {{ response.userId }}
                    </p>
                    <span class="text-xs text-gray-500 ml-2">
                      {{ formatDate(response.createdAt) }}
                    </span>
                  </div>
                  <p 
                    :class="[
                      'mt-1',
                      response.userId === authStore.user?.username ? 'text-emerald-700' : 'text-gray-700'
                    ]"
                  >
                    {{ response.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario de respuesta -->
    <div class="flex-none bg-white border-t p-4">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-start space-x-4">
          <div class="flex-1">
            <textarea 
              v-model="newResponse"
              rows="1"
              class="input-field resize-none min-h-[40px] py-2"
              placeholder="Escribe tu respuesta..."
              :disabled="ticketStore.isLoading"
              @keydown.enter.prevent="handleResponse"
            ></textarea>
          </div>
          <button 
            @click="handleResponse" 
            class="btn-primary px-4 h-[40px] flex items-center justify-center"
            :disabled="ticketStore.isLoading || !newResponse.trim()"
          >
            <svg 
              v-if="!ticketStore.isLoading" 
              class="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg 
              v-else 
              class="animate-spin h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'
import toastr from '../toastrConfig'

const props = defineProps<{
  ticketId: number
}>()

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const newResponse = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const ticket = computed(() => 
  ticketStore.tickets.find(t => t.id === props.ticketId)
)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Observar cambios en las respuestas para hacer scroll
watch(() => ticket.value?.responses?.length, async () => {
  await scrollToBottom()
})

// Cargar el ticket al montar el componente
onMounted(async () => {
  const success = await ticketStore.getTicket(props.ticketId)
  if (!success && ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
  }
  await scrollToBottom()
})

const statusOptions = [
  { value: 'open', label: 'Abierto' },
  { value: 'in-progress', label: 'En Proceso' },
  { value: 'resolved', label: 'Resuelto' }
]

const handleStatusChange = async (status: 'open' | 'in-progress' | 'resolved') => {
  const success = await ticketStore.updateTicketStatus(props.ticketId, status)
  if (!success && ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
  }
}

const handleResponse = async () => {
  if (!newResponse.value.trim() || !authStore.user) return

  const success = await ticketStore.addResponse(
    props.ticketId,
    authStore.user.username,
    newResponse.value
  )

  if (success) {
    newResponse.value = ''
  } else if (ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
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

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Abierto'
    case 'in-progress': return 'En Proceso'
    case 'resolved': return 'Resuelto'
    default: return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  })
}

const handleSelectChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const newStatus = select.value as 'open' | 'in-progress' | 'resolved'
  handleStatusChange(newStatus)
}
</script> 