<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { LayoutDashboard, Users, TicketCheck, CreditCard, Receipt, RefreshCw } from 'lucide-vue-next'
import TicketList from '../components/TicketList.vue'
import StatusLegend from '../components/StatusLegend.vue'
import { useTicketStore } from '../stores/tickets'
import { useUsersStore } from '../stores/users'
import toastr from '../toastrConfig'
import { useStatsStore } from '../stores/stats'

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

onMounted(async () => {
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
            <div v-else-if="statsStore.stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="card p-6">
                <h3 class="text-sm font-medium text-gray-500">Clientes Totales</h3>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ statsStore.stats.clientesTotales }}</p>
              </div>
              <div class="card p-6">
                <h3 class="text-sm font-medium text-gray-500">Tickets Activos</h3>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ statsStore.stats.ticketsActivos }}</p>
              </div>
              <div class="card p-6">
                <h3 class="text-sm font-medium text-gray-500">Ingresos Netos</h3>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ statsStore.stats.ingresosNetos }}€</p>
              </div>
              <div class="card p-6">
                <h3 class="text-sm font-medium text-gray-500">Comisiones</h3>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ statsStore.stats.comisionesTotales }}€</p>
                <p class="text-sm text-gray-500">{{ statsStore.stats.comisionesPorcentaje }}</p>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Recent Tickets -->
              <div class="card">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-lg font-medium text-gray-900">Tickets Recientes</h2>
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
                  :tickets="filteredTickets.slice(0, 5)"
                  :loading="ticketStore.isLoading"
                />
              </div>

              <!-- Recent Users -->
              <div class="card">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-lg font-medium text-gray-900">Usuarios Recientes</h2>
                  <button 
                    @click="loadUsers"
                    class="btn-secondary flex items-center space-x-2"
                    :disabled="usersStore.isLoading"
                  >
                    <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': usersStore.isLoading }" />
                    <span>Actualizar</span>
                  </button>
                </div>
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      </tr>
                    </thead>
                    <tbody v-if="!usersStore.isLoading" class="bg-white divide-y divide-gray-200">
                      <tr v-for="user in paginatedUsers.slice(0, 5)" :key="user.username">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.username }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(user.status)]">
                            {{ getStatusText(user.status) }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ new Date(user.createdAt).toLocaleDateString() }}
                        </td>
                      </tr>
                    </tbody>
                    <tbody v-else>
                      <tr v-for="i in 5" :key="i">
                        <td v-for="j in 3" :key="j" class="px-6 py-4 whitespace-nowrap">
                          <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'clients'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
            </div>

            <div class="card">
              <div class="flex justify-between items-center mb-6">
                <StatusLegend 
                  :items="userLegend"
                  :active-filter="activeUserFilter"
                  @filter="handleUserFilter"
                />
                <button 
                  @click="loadUsers"
                  class="btn-secondary flex items-center space-x-2"
                  :disabled="usersStore.isLoading"
                >
                  <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': usersStore.isLoading }" />
                  <span>Actualizar</span>
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody v-if="!usersStore.isLoading" class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in paginatedUsers" :key="user.username">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.username }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.businessName }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusColor(user.status)]">
                          {{ getStatusText(user.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select 
                          :value="user.status"
                          @change="handleStatusChange(user.username, $event.target.value)"
                          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                          :disabled="usersStore.isLoading"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr v-for="i in itemsPerPage" :key="i">
                      <td v-for="j in 5" :key="j" class="px-6 py-4 whitespace-nowrap">
                        <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Paginación -->
              <div class="flex justify-between items-center mt-4">
                <div class="text-sm text-gray-700">
                  Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a {{ Math.min(currentPage * itemsPerPage, usersStore.users.length) }} de {{ usersStore.users.length }} resultados
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="previousPage"
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
              <h2 class="text-2xl font-bold text-gray-900">Gestión de Tickets</h2>
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
</style> // TODO
/
