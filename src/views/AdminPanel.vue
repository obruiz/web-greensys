<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { LayoutDashboard, Users, TicketCheck, CreditCard, Receipt, RefreshCw } from 'lucide-vue-next'
import TicketList from '../components/TicketList.vue'
import CreateTicket from '../components/CreateTicket.vue'
import StatusLegend from '../components/StatusLegend.vue'
import { useTicketStore } from '../stores/tickets'
import { useUsersStore } from '../stores/users'
import axios from 'axios'
import toastr from '../toastrConfig'
import { useStatsStore } from '../stores/stats'

interface Stats {
  totalClients: string
  activeTickets: string
  clientChange: string
  ticketChange: string
  revenueChange: string
}

const activeTab = ref('dashboard')
const showCreateTicket = ref(false)
const ticketStore = useTicketStore()
const usersStore = useUsersStore()
const statsStore = useStatsStore()
const currentPage = ref(1)
const itemsPerPage = 5

const paginatedUsers = computed(() => {
  let filteredUsers = usersStore.users
  if (activeUserFilter.value) {
    filteredUsers = filteredUsers.filter(user => user.status === activeUserFilter.value)
  }
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.slice(start, end)
})

const totalPages = computed(() => {
  let filteredUsers = usersStore.users
  if (activeUserFilter.value) {
    filteredUsers = filteredUsers.filter(user => user.status === activeUserFilter.value)
  }
  return Math.ceil(filteredUsers.length / itemsPerPage)
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

const stats = ref([
  { label: 'Clientes Totales', value: '0', change: '0%' },
  { label: 'Tickets Activos', value: '0', change: '0%' },
  { label: 'Ingresos Totales', value: '0€', change: '0%' },
  { label: 'Comisiones Totales', value: '0€', change: '0%' }
])

const fetchStats = async () => {
  try {
    const response = await axios.get<Stats>('/api/stats')
    const data = response.data
    stats.value = [
      { label: 'Clientes Totales', value: data.totalClients, change: data.clientChange },
      { label: 'Tickets Activos', value: data.activeTickets, change: data.ticketChange },
      { label: 'Ingresos Netos', value: '0€', change: data.revenueChange },
      { label: 'Comisiones Totales', value: '0€', change: '0%' }
    ]
  } catch (error) {
    console.error('Error al obtener las estadísticas:', error)
  }
}

onMounted(async () => {
  await fetchStats()
  if (activeTab.value === 'clients') {
    await loadUsers()
  }
  await loadTickets()
  const success = await statsStore.fetchStats()
  if (!success && statsStore.lastError) {
    toastr.error(statsStore.lastError.message)
  }
})

async function loadUsers() {
  const success = await usersStore.fetchUsers()
  if (!success && usersStore.lastError) {
    toastr.error(usersStore.lastError.message)
  }
}

async function handleStatusChange(username: string, newStatus: 'pending' | 'active' | 'inactive') {
  const success = await usersStore.updateUserStatus(username, newStatus)
  if (success) {
    toastr.success('Estado del usuario actualizado exitosamente')
  } else if (usersStore.lastError) {
    toastr.error(usersStore.lastError.message)
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-emerald-600 bg-emerald-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'inactive':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'pending':
      return 'Pendiente'
    case 'inactive':
      return 'Inactivo'
    default:
      return status
  }
}

const ticketLegend = [
  { status: 'open', label: 'Abierto', class: 'bg-blue-50 text-blue-700' },
  { status: 'in-progress', label: 'En Proceso', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'resolved', label: 'Resuelto', class: 'bg-emerald-50 text-emerald-700' }
]

const activeTicketFilter = ref<string | undefined>(undefined)
const activeUserFilter = ref<string | undefined>(undefined)

const userLegend = [
  { status: 'active', label: 'Activo', class: 'bg-emerald-50 text-emerald-700' },
  { status: 'pending', label: 'Pendiente', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'inactive', label: 'Inactivo', class: 'bg-red-50 text-red-700' }
]

const filteredTickets = computed(() => {
  const tickets = ticketStore.tickets
  if (!activeTicketFilter.value) return tickets
  return tickets.filter(ticket => ticket.status === activeTicketFilter.value)
})

const handleTicketFilter = (status: string | undefined) => {
  activeTicketFilter.value = status
}

const handleUserFilter = (status: string | undefined) => {
  activeUserFilter.value = status
  currentPage.value = 1 // Resetear a la primera página al filtrar
}

// Observar cambios en activeTab para cargar datos cuando se cambia de pestaña
watch(activeTab, async (newTab) => {
  if (newTab === 'clients') {
    await loadUsers()
  }
  if (newTab === 'tickets' || newTab === 'dashboard') {
    await loadTickets()
  }
})

async function loadTickets() {
  const success = await ticketStore.fetchTickets()

  if (!success && ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
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
              Panel
            </a>
            <a 
              href="#" 
              @click.prevent="activeTab = 'clients'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'clients' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <Users class="h-5 w-5 mr-3" />
              Clientes
            </a>
            <a 
              href="#" 
              @click.prevent="activeTab = 'tickets'"
              :class="['flex items-center px-4 py-2 text-sm font-medium rounded-lg',
                activeTab === 'tickets' ? 'text-emerald-500 bg-emerald-50' : 'text-gray-600 hover:bg-gray-50']"
            >
              <TicketCheck class="h-5 w-5 mr-3" />
              Tickets
            </a>
          </nav>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <template v-if="activeTab === 'dashboard'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Panel de Control</h2>
                <button 
                  @click="statsStore.fetchStats()"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="statsStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': statsStore.isLoading }" />
                  <span>Recargar Estadísticas</span>
                </button>
              </div>
            </div>

            <!-- Stats Grid -->
            <div v-if="statsStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <!-- Skeleton loaders -->
              <div v-for="i in 4" :key="i" class="card p-6">
                <div class="flex items-center justify-between">
                  <div class="w-full">
                    <div class="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                    <div class="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div class="p-3 bg-gray-100 rounded-full">
                    <div class="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <!-- Total Clients -->
              <div class="card p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Clientes Totales</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">
                      {{ statsStore.stats?.clientesTotales || 0 }}
                    </p>
                  </div>
                  <div class="p-3 bg-emerald-50 rounded-full">
                    <Users class="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </div>

              <!-- Active Tickets -->
              <div class="card p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Tickets Activos</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">
                      {{ statsStore.stats?.ticketsActivos || 0 }}
                    </p>
                  </div>
                  <div class="p-3 bg-blue-50 rounded-full">
                    <TicketCheck class="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <!-- Net Income -->
              <div class="card p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Ingresos Netos</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">
                      {{ (statsStore.stats?.ingresosNetos || 0).toFixed(2) }}€
                    </p>
                  </div>
                  <div class="p-3 bg-purple-50 rounded-full">
                    <CreditCard class="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              <!-- Total Commissions -->
              <div class="card p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Comisiones Totales</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">
                      {{ (statsStore.stats?.comisionesTotales || 0).toFixed(2) }}€
                    </p>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ statsStore.stats?.comisionesPorcentaje || '0%' }} promedio
                    </p>
                  </div>
                  <div class="p-3 bg-yellow-50 rounded-full">
                    <Receipt class="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-if="statsStore.lastError" class="mb-8 p-4 bg-red-50 text-red-700 rounded-lg">
              {{ statsStore.lastError.message }}
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-medium text-gray-900">Tickets Recientes</h2>
                <button 
                  class="btn-primary" 
                  @click="activeTab = 'tickets'"
                >
                  Ver todos
                </button>
              </div>
              <TicketList :show-all="false" :max-items="4" :filtered-tickets="ticketStore.tickets" />
            </div>
          </template>

          <template v-if="activeTab === 'clients'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
                <button 
                  @click="loadUsers"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="usersStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': usersStore.isLoading }" />
                  <span>Recargar</span>
                </button>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="p-4 bg-gray-50">
                <StatusLegend 
                  :items="userLegend"
                  :active-filter="activeUserFilter"
                  @filter="handleUserFilter"
                />
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in paginatedUsers" :key="user.username" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div>
                            <div class="text-sm font-medium text-gray-900">
                              {{ user.username }}
                            </div>
                            <div class="text-sm text-gray-500">
                              {{ user.role === 'admin' ? 'Administrador' : 'Cliente' }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ user.email }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ user.businessName }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">{{ user.phone }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="getStatusColor(user.status)"
                        >
                          {{ getStatusText(user.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-2">
                          <select 
                            v-if="user.role !== 'admin'"
                            class="input-field text-sm py-1"
                            :value="user.status"
                            :disabled="usersStore.isLoading"
                            @change="(e: Event) => {
                              const select = e.target as HTMLSelectElement;
                              const newStatus = select.value as 'pending' | 'active' | 'inactive';
                              handleStatusChange(user.username, newStatus);
                            }"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div class="flex-1 flex justify-between items-center">
                  <div>
                    <p class="text-sm text-gray-700">
                      Mostrando <span class="font-medium">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> a <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, usersStore.users.length) }}</span> de <span class="font-medium">{{ usersStore.users.length }}</span> usuarios
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

            <!-- Loading overlay -->
            <div 
              v-if="usersStore.isLoading" 
              class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div class="bg-white p-4 rounded-lg">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p class="mt-2 text-sm text-gray-600">Cargando...</p>
              </div>
            </div>
          </template>

          <template v-if="activeTab === 'tickets'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Gestión de Tickets</h2>
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
        </div>
      </div>
    </div>
  </section>
</template>