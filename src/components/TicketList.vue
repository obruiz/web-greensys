<script setup lang="ts">
import { ref, computed, PropType, watch } from 'vue'
import { useTicketStore } from '../stores/tickets'
import TicketDetails from './TicketDetails.vue'

interface Ticket {
  id: number;
  title: string;
  userId: string;
  status: string;
  createdAt: string;
}

const props = defineProps({
  showAll: {
    type: Boolean,
    default: true
  },
  maxItems: {
    type: Number,
    default: undefined
  },
  filteredTickets: {
    type: Array as PropType<Ticket[]>,
    default: () => []
  }
})

const ticketStore = useTicketStore()
const selectedTicketId = ref<number | null>(null)
const currentPage = ref(1)
const itemsPerPage = 5

const paginatedTickets = computed(() => {
  // Siempre usamos los tickets filtrados si están disponibles
  const tickets = props.filteredTickets
  
  // Si tenemos maxItems y no es la vista completa, limitamos los resultados
  if (props.maxItems && !props.showAll) {
    return tickets.slice(0, props.maxItems)
  }
  
  // Si es la vista completa, aplicamos paginación
  if (props.showAll) {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return tickets.slice(start, end)
  }
  
  return tickets
})

const totalPages = computed(() => {
  // Solo calculamos páginas totales si es la vista completa
  if (!props.showAll) return 1
  
  // Siempre usamos los tickets filtrados para calcular las páginas
  return Math.ceil(props.filteredTickets.length / itemsPerPage)
})

// Resetear la página cuando cambian los tickets filtrados
watch(() => props.filteredTickets, () => {
  currentPage.value = 1
})

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <div v-if="selectedTicketId" class="mb-4">
      <div class="flex justify-between items-center mb-4">
        <button 
          @click="selectedTicketId = null"
          class="btn-secondary flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver a tickets</span>
        </button>
      </div>
      <TicketDetails 
        :ticket-id="selectedTicketId" 
        @close="selectedTicketId = null"
      />
    </div>
    
    <div v-else-if="ticketStore.isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="bg-white p-4 rounded-lg">
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="!paginatedTickets.length" class="text-center py-8 text-gray-500">
      <p>No hay tickets disponibles</p>
      <p class="text-sm mt-2">Los tickets aparecerán aquí cuando se creen nuevas solicitudes de soporte.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="ticket in paginatedTickets" 
           :key="ticket.id"
           class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
           @click="selectedTicketId = ticket.id"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ ticket.title }}</h3>
            <p class="text-sm text-gray-600">
              {{ formatDate(ticket.createdAt) }} • {{ ticket.userId }}
            </p>
          </div>
          <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(ticket.status)]">
            {{ getStatusLabel(ticket.status) }}
          </span>
        </div>
      </div>

      <!-- Paginación - solo se muestra en la vista completa -->
      <div v-if="props.showAll && totalPages > 1" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <div class="flex-1 flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> a 
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, (props.filteredTickets.length > 0 ? props.filteredTickets : ticketStore.tickets).length) }}</span> de 
              <span class="font-medium">{{ (props.filteredTickets.length > 0 ? props.filteredTickets : ticketStore.tickets).length }}</span> tickets
            </p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="btn-secondary px-3 py-1 text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              Anterior
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="btn-secondary px-3 py-1 text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage >= totalPages }"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>