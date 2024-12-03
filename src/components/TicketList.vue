<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'
import TicketDetails from './TicketDetails.vue'
import StatusLegend from './StatusLegend.vue'

const props = defineProps<{
  showAll?: boolean;
  filteredTickets?: typeof ticketStore.tickets;
}>()

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const selectedTicketId = ref<number | null>(null)
const activeFilter = ref<string | null>(null)

const ticketLegend = [
  { status: 'open', label: 'Abierto', class: 'bg-blue-50 text-blue-700' },
  { status: 'in-progress', label: 'En Proceso', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'resolved', label: 'Resuelto', class: 'bg-emerald-50 text-emerald-700' }
]

const tickets = computed(() => {
  let filteredTickets = props.filteredTickets || (props.showAll || authStore.isAdmin
    ? ticketStore.tickets
    : ticketStore.tickets.filter(ticket => ticket.userId === authStore.user?.username))

  if (activeFilter.value) {
    filteredTickets = filteredTickets.filter(ticket => ticket.status === activeFilter.value)
  }

  return filteredTickets
})

const handleFilter = (status: string | null) => {
  activeFilter.value = status
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
  <div>
    <div v-if="selectedTicketId" class="mb-4">
      <div class="flex justify-between items-center mb-4">
        <button @click="selectedTicketId = null" class="btn-secondary">
          ← Volver a la lista
        </button>
      </div>
      <TicketDetails :ticketId="selectedTicketId" />
    </div>
    
    <div v-else>
      <div class="space-y-4">
        <div v-if="tickets.length === 0" 
             class="text-center py-8 text-gray-500">
          <p v-if="activeFilter">
            No hay tickets con el estado "{{ ticketLegend.find(t => t.status === activeFilter)?.label }}"
          </p>
          <p v-else>
            No hay tickets disponibles.
          </p>
          <p class="text-sm mt-2">Los tickets aparecerán aquí cuando se creen.</p>
        </div>
        
        <div v-else v-for="ticket in tickets" 
             :key="ticket.id" 
             @click="selectedTicketId = ticket.id"
             class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
          <div>
            <div class="font-medium text-gray-900">{{ ticket.title }}</div>
            <div class="text-sm text-gray-600">
              Ticket #{{ ticket.id }} • Creado el {{ new Date(ticket.createdAt).toLocaleDateString() }}
              • Por {{ ticket.userId }}
            </div>
          </div>
          <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(ticket.status)]">
            {{ ticket.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>