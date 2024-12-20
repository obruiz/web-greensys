<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-gray-900">Panel de Cliente</h1>
  </div>
</template>

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
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="sale in paginatedSales" :key="sale.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(sale.createdAt).toLocaleDateString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ sale.amount.toFixed(2) }}€
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['px-2 py-1 text-xs font-medium rounded-full', salesStore.statusClasses[sale.status]]">
                          {{ salesStore.statusLabels[sale.status] }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          v-if="sale.status === 'paid'"
                          @click="handleRefund(sale.id)"
                          class="text-red-600 hover:text-red-900"
                          :disabled="salesStore.isLoading"
                        >
                          Reembolsar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredSales.length) }} de {{ filteredSales.length }} resultados
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="btn-secondary"
                  >
                    Anterior
                  </button>
                  <button 
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="btn-secondary"
                  >
                    Siguiente
                  </button>
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
                    <span>Actualizar</span>
                  </button>
                </div>
              </div>

              <TicketList 
                :tickets="filteredTickets.slice(0, 5)"
                :loading="ticketStore.isLoading"
              />
            </div>
          </template>

          <template v-else-if="activeTab === 'purchases'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <StatusLegend 
                  :items="salesLegend"
                  :active-filter="activeSaleFilter"
                  @filter="handleSaleFilter"
                />
                <button 
                  @click="loadSales"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="salesStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': salesStore.isLoading }" />
                  <span>Actualizar</span>
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="sale in paginatedSales" :key="sale.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.id }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ new Date(sale.createdAt).toLocaleDateString() }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ sale.amount.toFixed(2) }}€
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ sale.commission.total.toFixed(2) }}€
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['px-2 py-1 text-xs font-medium rounded-full', salesStore.statusClasses[sale.status]]">
                          {{ salesStore.statusLabels[sale.status] }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          v-if="sale.status === 'paid'"
                          @click="handleRefund(sale.id)"
                          class="text-red-600 hover:text-red-900"
                          :disabled="salesStore.isLoading"
                        >
                          Reembolsar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, filteredSales.length) }} de {{ filteredSales.length }} resultados
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="btn-secondary"
                  >
                    Anterior
                  </button>
                  <button 
                    @click="nextPage"
                    :disabled="currentPage === totalPages"
                    class="btn-secondary"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'tickets'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Soporte Técnico</h2>
                <button 
                  @click="showCreateTicket = true"
                  class="btn-primary"
                >
                  Nuevo Ticket
                </button>
              </div>
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <StatusLegend 
                  :items="ticketLegend"
                  :active-filter="activeTicketFilter"
                  @filter="handleTicketFilter"
                />
                <button 
                  @click="loadTickets"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="ticketStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': ticketStore.isLoading }" />
                  <span>Actualizar</span>
                </button>
              </div>

              <TicketList 
                :tickets="filteredTickets"
                :loading="ticketStore.isLoading"
              />
            </div>
          </template>

          <template v-else-if="activeTab === 'apikeys'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">API Keys</h2>
            </div>

            <ApiKeyManager />
          </template>

          <template v-else-if="activeTab === 'invoices'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Facturas</h2>
            </div>

            <InvoiceList />
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed;
}
</style> 