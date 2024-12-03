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
  const tickets = ticketStore.tickets
  if (!activeTicketFilter.value) return tickets
  return tickets.filter(ticket => ticket.status === activeTicketFilter.value)
})

const handleSaleFilter = (status: string | null) => {
  activeSaleFilter.value = status
}

const handleTicketFilter = (status: string | null) => {
  activeTicketFilter.value = status
}

const showModal = ref(false)
const modalType = ref<'cancel' | 'refund'>('cancel')
const selectedSale = ref<any>(null)

const showCancelConfirm = (sale: any) => {
  selectedSale.value = sale
  modalType.value = 'cancel'
  showModal.value = true
}

const showRefundConfirm = (sale: any) => {
  selectedSale.value = sale
  modalType.value = 'refund'
  showModal.value = true
}

const confirmAction = () => {
  if (selectedSale.value) {
    if (modalType.value === 'cancel') {
      salesStore.cancelSale(selectedSale.value.id)
    } else {
      salesStore.refundSale(selectedSale.value.id)
    }
    showModal.value = false
    selectedSale.value = null
  }
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
                <div v-if="salesStore.getSalesByUser(authStore.user?.username || '').length === 0"
                     class="text-center py-8 text-gray-500">
                  <p>Todavía no tienes ventas registradas.</p>
                </div>
                <div v-else v-for="sale in salesStore.getSalesByUser(authStore.user?.username || '').slice(0, 5)" 
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
              <div class="space-y-4">
                <div v-if="filteredSales.length === 0" 
                     class="text-center py-8 text-gray-500">
                  <p v-if="activeSaleFilter">
                    No hay ventas con el estado "{{ salesLegend.find(s => s.status === activeSaleFilter)?.label }}"
                  </p>
                  <p v-else>
                    Todavía no tienes ventas registradas.
                  </p>
                </div>
                <div v-else v-for="sale in filteredSales" 
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
                    <div class="flex items-center space-x-2">
                      <button v-if="salesStore.canCancelSale(sale)"
                              @click.stop="showCancelConfirm(sale)"
                              class="text-sm text-red-600 hover:text-red-800">
                        Cancelar
                      </button>
                      <button v-if="salesStore.canRefundSale(sale)"
                              @click.stop="showRefundConfirm(sale)"
                              class="text-sm text-purple-600 hover:text-purple-800">
                        Reembolsar
                      </button>
                    </div>
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
          </template>

          <template v-if="activeTab === 'tickets'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Tickets de Soporte</h2>
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

  <!-- Modal simple -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">
        {{ modalType === 'cancel' ? 'Confirmar Cancelación' : 'Confirmar Reembolso' }}
      </h3>
      <p class="text-sm text-gray-500 mb-6">
        ¿Estás seguro de que quieres {{ modalType === 'cancel' ? 'cancelar' : 'reembolsar' }} 
        esta venta? Esta acción no se puede deshacer.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          class="btn-secondary"
          @click="showModal = false"
        >
          No, mantener
        </button>
        <button
          :class="[
            'btn-primary',
            modalType === 'cancel' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          ]"
          @click="confirmAction"
        >
          Sí, {{ modalType === 'cancel' ? 'cancelar' : 'reembolsar' }}
        </button>
      </div>
    </div>
  </div>
</template>