<script setup lang="ts">
import { ref, computed } from 'vue'
import { LayoutDashboard, CreditCard, TicketCheck, Key, Switch } from 'lucide-vue-next'
import TicketList from '../components/TicketList.vue'
import CreateTicket from '../components/CreateTicket.vue'
import ApiKeyManager from '../components/ApiKeyManager.vue'
import { useAuthStore } from '../stores/auth'
import { useSalesStore } from '../stores/sales'
import { useTicketStore } from '../stores/tickets'
import StatusLegend from '../components/StatusLegend.vue'

const activeTab = ref('dashboard')
const showCreateTicket = ref(false)
const authStore = useAuthStore()
const salesStore = useSalesStore()
const ticketStore = useTicketStore()

const activeSaleFilter = ref<string | null>(null)
const activeTicketFilter = ref<string | null>(null)

const salesLegend = [
  { status: 'pending', label: 'Pendiente de pago', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'paid', label: 'Pagada', class: 'bg-emerald-50 text-emerald-700' },
  { status: 'failed', label: 'Fallida', class: 'bg-red-50 text-red-700' },
  { status: 'refunded', label: 'Reembolsada', class: 'bg-purple-50 text-purple-700' },
  { status: 'cancelled', label: 'Cancelada', class: 'bg-gray-50 text-gray-700' }
]

const ticketLegend = [
  { status: 'open', label: 'Abierto', class: 'bg-blue-50 text-blue-700' },
  { status: 'in-progress', label: 'En Proceso', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'resolved', label: 'Resuelto', class: 'bg-emerald-50 text-emerald-700' }
]

// Computed para filtrar ventas
const filteredSales = computed(() => {
  const sales = salesStore.getSalesByUser(authStore.user?.username || '')
  if (!activeSaleFilter.value) return sales
  return sales.filter(sale => sale.status === activeSaleFilter.value)
})

// Computed para filtrar tickets
const filteredTickets = computed(() => {
  const userTickets = ticketStore.getTicketsByUser(authStore.user?.username || '')
  if (!activeTicketFilter.value) return userTickets
  return userTickets.filter(ticket => ticket.status === activeTicketFilter.value)
})

const handleSaleFilter = (status: string | null) => {
  activeSaleFilter.value = activeSaleFilter.value === status ? null : status
}

const handleTicketFilter = (status: string | null) => {
  activeTicketFilter.value = activeTicketFilter.value === status ? null : status
}
</script>

<template>
  <section class="py-12">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex">
        <!-- Sidebar -->
        <div class="w-64 pr-8">
          <nav class="space-y-1">
            <a 
              href="#" 
              @click.prevent="activeTab = 'dashboard'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'dashboard' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <LayoutDashboard class="h-5 w-5 mr-3" />
              Resumen
            </a>
            <a 
              href="#" 
              @click.prevent="activeTab = 'purchases'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'purchases' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <CreditCard class="h-5 w-5 mr-3" />
              Ventas
            </a>
            <a 
              href="#" 
              @click.prevent="activeTab = 'tickets'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'tickets' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <TicketCheck class="h-5 w-5 mr-3" />
              Soporte
            </a>
            <a 
              href="#" 
              @click.prevent="activeTab = 'apikeys'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'apikeys' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <Key class="h-5 w-5 mr-3" />
              API Keys
            </a>
          </nav>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <template v-if="activeTab === 'dashboard'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">
                Bienvenido de nuevo, {{ authStore.user?.username }}
              </h2>
            </div>

            <div class="card mb-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-medium text-gray-900">Ventas Recientes</h2>
                <button class="btn-primary" @click="activeTab = 'purchases'">Ver todas</button>
              </div>
              <div class="space-y-4">
                <div v-for="sale in salesStore.getSalesByUser(authStore.user?.username || '').slice(0, 5)" 
                     :key="sale.id"
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div class="font-medium text-gray-900">{{ sale.description }}</div>
                    <div class="text-sm text-gray-600">
                      {{ new Date(sale.createdAt).toLocaleDateString() }}
                      • Ref: {{ sale.reference }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', 
                                  salesStore.statusClasses[sale.status]]">
                      {{ salesStore.statusLabels[sale.status] }}
                    </span>
                    <div class="text-lg font-medium text-gray-900">
                      {{ sale.amount.toFixed(2) }}€
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-medium text-gray-900">Tickets Recientes</h2>
                <button class="btn-primary" @click="activeTab = 'tickets'">Ver todos</button>
              </div>
              <TicketList :show-all="false" :max-items="5" />
            </div>
          </template>

          <template v-if="activeTab === 'purchases'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
            </div>
            <div class="card">
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <StatusLegend 
                  :items="salesLegend"
                  :active-filter="activeSaleFilter"
                  @filter="handleSaleFilter"
                />
              </div>
              <div v-if="authStore.userPurchases.length === 0" 
                   class="text-center py-12 text-gray-500">
                <p class="text-lg">Todavía no tienes ventas registradas</p>
                <p class="text-sm mt-2">Las ventas aparecerán aquí una vez que proceses pagos a través de tu TPV virtual.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="purchase in authStore.userPurchases" :key="purchase.id"
                     class="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div class="font-medium text-gray-900">{{ purchase.name }}</div>
                    <div class="text-sm text-gray-600">{{ purchase.date }}</div>
                  </div>
                  <div class="text-lg font-medium text-gray-900">{{ purchase.amount }}</div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="activeTab === 'tickets'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Tickets de Soporte</h2>
                <button 
                  @click="showCreateTicket = true"
                  class="btn-primary flex items-center space-x-2"
                >
                  <span>Crear Ticket</span>
                </button>
              </div>
            </div>
            <div class="card">
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <StatusLegend 
                  :items="ticketLegend"
                  :active-filter="activeTicketFilter"
                  @filter="handleTicketFilter"
                />
              </div>
              <TicketList :filtered-tickets="filteredTickets" />
            </div>

            <!-- Modal de Crear Ticket -->
            <div v-if="showCreateTicket" 
                 class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-medium text-gray-900">Crear Nuevo Ticket</h3>
                  <button 
                    @click="showCreateTicket = false"
                    class="text-gray-400 hover:text-gray-500"
                  >
                    <span class="sr-only">Cerrar</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <CreateTicket @created="showCreateTicket = false" />
              </div>
            </div>
          </template>

          <template v-if="activeTab === 'apikeys'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">API Keys</h2>
              </div>
            </div>
            <div class="card">
              <ApiKeyManager />
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>