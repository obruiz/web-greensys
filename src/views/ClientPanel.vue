<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { LayoutDashboard, CreditCard, TicketCheck, Key, Receipt, RefreshCw } from 'lucide-vue-next'
import TicketList from '../components/TicketList.vue'
import CreateTicket from '../components/CreateTicket.vue'
import ApiKeyManager from '../components/ApiKeyManager.vue'
import { useAuthStore } from '../stores/auth'
import { useSalesStore } from '../stores/sales'
import { useTicketStore } from '../stores/tickets'
import { useApiKeyStore } from '../stores/apikeys'
import { useInvoiceStore } from '../stores/invoices'
import InvoiceList from '../components/InvoiceList.vue'
import StatusLegend from '../components/StatusLegend.vue'
import toastr from '../toastrConfig'

const activeTab = ref('dashboard')
const showCreateTicket = ref(false)
const currentPage = ref(1)
const itemsPerPage = 5
const authStore = useAuthStore()
const salesStore = useSalesStore()
const ticketStore = useTicketStore()
const apiKeyStore = useApiKeyStore()
const invoiceStore = useInvoiceStore()

const activeSaleFilter = ref<string | undefined>(undefined)
const activeTicketFilter = ref<string | undefined>(undefined)

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

const handleSaleFilter = (status: string | undefined) => {
  activeSaleFilter.value = status
}

const handleTicketFilter = (status: string | undefined) => {
  activeTicketFilter.value = status
}

// Observar cambios en el filtro de tickets para recargar
watch(activeTicketFilter, async () => {
  if (activeTab.value === 'tickets') {
    await loadTickets()
  }
})

const filteredSales = computed(() => {
  let sales = salesStore.getSalesByUser(authStore.user?.username || '')
  if (activeSaleFilter.value) {
    sales = sales.filter(sale => sale.status === activeSaleFilter.value)
  }
  return sales
})

const filteredTickets = computed(() => {
  const tickets = ticketStore.getMyTickets
  if (!activeTicketFilter.value) return tickets
  return tickets.filter(ticket => ticket.status === activeTicketFilter.value)
})

const paginatedSales = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSales.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSales.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset página cuando cambie el filtro
watch(activeSaleFilter, () => {
  currentPage.value = 1
})

// Cargar tickets y ventas al montar el componente
onMounted(async () => {
  await Promise.all([
    loadTickets(),
    loadSales(),
    loadApiKeys(),
    loadInvoices()
  ])
})

// Cargar tickets cuando se cambia a la pestaña de tickets o dashboard
watch(activeTab, async (newTab) => {
  if (newTab === 'tickets' || newTab === 'dashboard') {
    await loadTickets()
  }
  if (newTab === 'purchases' || newTab === 'dashboard') {
    await loadSales()
  }
  if (newTab === 'apikeys') {
    await loadApiKeys()
  }
  if (newTab === 'invoices') {
    await loadInvoices()
  }
})

async function loadTickets() {
  const success = await ticketStore.fetchTickets()
  if (!success && ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
  }
}

async function loadSales() {
  const success = await salesStore.fetchSales()
  if (!success && salesStore.lastError) {
    toastr.error(salesStore.lastError.message)
  }
}

async function loadApiKeys() {
  const success = await apiKeyStore.fetchApiKeys()
  if (!success && apiKeyStore.lastError) {
    toastr.error(apiKeyStore.lastError.message)
  }
}

async function loadInvoices() {
  const success = await invoiceStore.fetchInvoices()
  if (!success && invoiceStore.lastError) {
    toastr.error(invoiceStore.lastError.message)
  }
}

const calculateCommission = (amount: number) => {
  // Tarifa europea: 1.4% + 0.25€
  const percentage = 1.4
  const fixed = 0.25
  return {
    percentage,
    fixed,
    total: (amount * (percentage / 100)) + fixed
  }
}

const handleRefund = async (saleId: number) => {
  try {
    const success = await salesStore.refundSale(saleId)
    if (success) {
      toastr.success('Venta reembolsada correctamente')
    } else if (salesStore.lastError) {
      toastr.error(salesStore.lastError.message)
    }
  } catch (error) {
    console.error('Error al reembolsar:', error)
    toastr.error('Error al procesar el reembolso')
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
            <a 
              href="#" 
              @click.prevent="activeTab = 'invoices'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'invoices' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <Receipt class="h-5 w-5 mr-3" />
              Facturas
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
                <div class="flex items-center space-x-2">
                  <button 
                    @click="loadSales"
                    class="btn-secondary flex items-center space-x-2"
                    :disabled="salesStore.isLoading"
                  >
                    <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': salesStore.isLoading }" />
                    <span>Recargar</span>
                  </button>
                  <button class="btn-primary" @click="activeTab = 'purchases'">Ver todas</button>
                </div>
              </div>
              <div class="space-y-4">
                <div v-if="salesStore.getSalesByUser(authStore.user?.username || '').length === 0" 
                     class="text-center py-8 text-gray-500">
                  <p>Todavía no tienes ventas registradas</p>
                  <p class="text-sm mt-2">Las ventas aparecerán aquí una vez que proceses pagos a través de tu TPV virtual.</p>
                </div>
                <div v-else v-for="sale in salesStore.getSalesByUser(authStore.user?.username || '').slice(0, 4)" 
                     :key="sale.id"
                     class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div class="font-medium text-gray-900">{{ sale.description }}</div>
                    <div class="text-sm text-gray-600">
                      {{ new Date(sale.createdAt).toLocaleDateString() }}
                      • Ref: {{ sale.reference }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Comisión: {{ calculateCommission(sale.amount).total.toFixed(2) }}€
                      ({{ calculateCommission(sale.amount).percentage }}% + {{ calculateCommission(sale.amount).fixed }}€)
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', 
                                  salesStore.statusClasses[sale.status]]">
                      {{ salesStore.statusLabels[sale.status] }}
                    </span>
                    <div class="text-right">
                      <div class="text-lg font-medium text-gray-900">
                        {{ sale.amount.toFixed(2) }}€
                      </div>
                      <div class="text-xs text-gray-500">
                        Sin comisiones: {{ (sale.amount - calculateCommission(sale.amount).total).toFixed(2) }}€
                      </div>
                      <button 
                        v-if="sale.status === 'paid'"
                        @click="handleRefund(sale.id)"
                        class="mt-2 text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reembolsar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-medium text-gray-900">Tickets Recientes</h2>
                <div class="flex items-center space-x-2">
                  <button 
                    @click="loadTickets"
                    class="btn-secondary flex items-center space-x-2"
                    :disabled="ticketStore.isLoading"
                  >
                    <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': ticketStore.isLoading }" />
                    <span>Recargar</span>
                  </button>
                  <button class="btn-primary" @click="activeTab = 'tickets'">Ver todos</button>
                </div>
              </div>
              <div v-if="ticketStore.getMyTickets.length === 0" 
                   class="text-center py-8 text-gray-500">
                <p>No tienes tickets de soporte abiertos</p>
                <p class="text-sm mt-2">Los tickets aparecerán aquí cuando necesites ayuda o soporte técnico.</p>
              </div>
              <TicketList v-else :show-all="false" :max-items="4" :filtered-tickets="ticketStore.getMyTickets" />
            </div>
          </template>

          <template v-if="activeTab === 'purchases'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
                <button 
                  @click="loadSales"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="salesStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': salesStore.isLoading }" />
                  <span>Recargar</span>
                </button>
              </div>
            </div>
            <div class="card">
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <StatusLegend 
                  :items="salesLegend"
                  :active-filter="activeSaleFilter"
                  @filter="handleSaleFilter"
                />
              </div>
              <div v-if="filteredSales.length === 0" 
                   class="text-center py-12 text-gray-500">
                <p class="text-lg">Todavía no tienes ventas registradas</p>
                <p class="text-sm mt-2">Las ventas aparecerán aquí una vez que proceses pagos a través de tu TPV virtual.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="sale in paginatedSales" :key="sale.id"
                     class="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div class="font-medium text-gray-900">{{ sale.description }}</div>
                    <div class="text-sm text-gray-600">
                      {{ new Date(sale.createdAt).toLocaleDateString() }}
                      • Ref: {{ sale.reference }}
                    </div>
                    <div class="text-xs text-gray-500">
                      Comisión: {{ calculateCommission(sale.amount).total.toFixed(2) }}€
                      ({{ calculateCommission(sale.amount).percentage }}% + {{ calculateCommission(sale.amount).fixed }}€)
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span :class="['px-2 py-1 text-xs font-medium rounded-full', salesStore.statusClasses[sale.status]]">
                      {{ salesStore.statusLabels[sale.status] }}
                    </span>
                    <div class="text-right">
                      <div class="text-lg font-medium text-gray-900">
                        {{ sale.amount.toFixed(2) }}€
                      </div>
                      <div class="text-xs text-gray-500">
                        Sin comisiones: {{ (sale.amount - calculateCommission(sale.amount).total).toFixed(2) }}€
                      </div>
                      <button 
                        v-if="sale.status === 'paid'"
                        @click="handleRefund(sale.id)"
                        class="mt-2 text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        Reembolsar
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Paginación -->
                <div v-if="totalPages > 1" class="flex items-center justify-between border-t pt-4 mt-4">
                  <div class="text-sm text-gray-500">
                    Mostrando {{ ((currentPage - 1) * itemsPerPage) + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredSales.length) }} de {{ filteredSales.length }} ventas
                  </div>
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      :class="[
                        'px-3 py-1 rounded-lg text-sm font-medium',
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      Anterior
                    </button>
                    <span class="text-sm text-gray-600">
                      Página {{ currentPage }} de {{ totalPages }}
                    </span>
                    <button 
                      @click="nextPage"
                      :disabled="currentPage === totalPages"
                      :class="[
                        'px-3 py-1 rounded-lg text-sm font-medium',
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      ]"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template v-if="activeTab === 'tickets'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Tickets de Soporte</h2>
                <div class="flex items-center space-x-2">
                  <button 
                    @click="loadTickets"
                    class="btn-secondary flex items-center space-x-2"
                    :disabled="ticketStore.isLoading"
                  >
                    <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': ticketStore.isLoading }" />
                    <span>Recargar</span>
                  </button>
                  <button 
                    @click="showCreateTicket = true"
                    class="btn-primary flex items-center space-x-2"
                  >
                    <span>Crear Ticket</span>
                  </button>
                </div>
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
              <TicketList :show-all="true" :filtered-tickets="filteredTickets" />
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

          <template v-if="activeTab === 'invoices'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Facturas</h2>
                <button 
                  @click="loadInvoices"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="invoiceStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': invoiceStore.isLoading }" />
                  <span>Recargar</span>
                </button>
              </div>
            </div>
            <div class="card">
              <InvoiceList />
            </div>
          </template>
        </div>
      </div>

    </div>
  </section>
</template>