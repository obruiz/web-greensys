<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { LayoutDashboard, Users, TicketCheck } from 'lucide-vue-next'
import TicketList from '../components/TicketList.vue'
import CreateTicket from '../components/CreateTicket.vue'
import StatusLegend from '../components/StatusLegend.vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const activeTab = ref('dashboard')
const showCreateTicket = ref(false)
const ticketStore = useTicketStore()
const authStore = useAuthStore()
const pendingUsers = computed(() => 
  authStore.registeredUsers.filter(user => user.role === 'client')
)

const { registeredUsers } = authStore

const toggleUserStatus = (username: string) => {
  authStore.toggleUserStatus(username)
}

const stats = ref([
  { label: 'Clientes Totales', value: '0', change: '0%' },
  { label: 'Tickets Activos', value: '0', change: '0%' },
  { label: 'Ingresos Totales', value: '0€', change: '0%' },
  { label: 'Comisiones Totales', value: '0€', change: '0%' }
])

const fetchStats = async () => {
  try {
    const response = await axios.get('/api/stats')
    const data = response.data
    stats.value = [
      { label: 'Clientes Totales', value: data.totalClients, change: data.clientChange },
      { label: 'Tickets Activos', value: data.activeTickets, change: data.ticketChange },
      { label: 'Ingresos Netos', value: `€${calculateNetRevenue.value.toFixed(2)}`, change: data.revenueChange },
      { label: 'Comisiones Totales', value: `${calculateTotalCommissions.value.toFixed(2)}€`, change: '0%' }
    ]
  } catch (error) {
    console.error('Error al obtener las estadísticas:', error)
  }
}

onMounted(() => {
  fetchStats()
})

const selectedUser = ref(null)
const showModal = ref(false)

const openUserDetails = (user) => {
  selectedUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const ticketLegend = [
  { status: 'open', label: 'Abierto', class: 'bg-blue-50 text-blue-700' },
  { status: 'in-progress', label: 'En Proceso', class: 'bg-yellow-50 text-yellow-700' },
  { status: 'resolved', label: 'Resuelto', class: 'bg-emerald-50 text-emerald-700' }
]

const activeTicketFilter = ref<string | null>(null)

const filteredTickets = computed(() => {
  const tickets = ticketStore.tickets
  if (!activeTicketFilter.value) return tickets
  return tickets.filter(ticket => ticket.status === activeTicketFilter.value)
})

const handleTicketFilter = (status: string | null) => {
  activeTicketFilter.value = activeTicketFilter.value === status ? null : status
}

const calculateTotalCommissions = computed(() => {
  return salesStore.sales.reduce((total, sale) => {
    if (sale.status === 'paid') {
      return total + sale.commission.amount
    }
    return total
  }, 0)
})

const calculateNetRevenue = computed(() => {
  return salesStore.sales.reduce((total, sale) => {
    if (sale.status === 'paid') {
      return total + sale.commission.total
    }
    return total
  }, 0)
})
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
              <h2 class="text-2xl font-bold text-gray-900">Panel de Administración</h2>
            </div>

            <div class="grid grid-cols-4 gap-6 mb-8">
              <div v-for="stat in stats" :key="stat.label" class="card">
                <div class="text-sm font-medium text-gray-600">{{ stat.label }}</div>
                <div class="mt-2 text-3xl font-bold text-gray-900">{{ stat.value }}</div>
                <div class="mt-1 text-sm text-emerald-500">{{ stat.change }}</div>
              </div>
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
              <TicketList :showAll="true" :max-items="5" />
            </div>
          </template>

          <template v-if="activeTab === 'tickets'">
            <div class="mb-8">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Gestión de Tickets</h2>
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

          <template v-if="activeTab === 'clients'">
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
            </div>
            <div class="card">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Gestión de Clientes</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in registeredUsers.filter(u => u.role === 'client')" :key="user.username">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-medium text-gray-900">{{ user.username }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm">
                          <div>{{ user.businessName }}</div>
                          <div class="text-gray-500">{{ user.businessType }}</div>
                          <div class="text-gray-500">{{ user.country }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm">
                          <div>{{ user.phone }}</div>
                          <div>{{ user.email }}</div>
                          <div class="text-gray-500">{{ user.website || 'N/A' }}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span :class="{
                          'px-2 py-1 text-xs font-medium rounded-full': true,
                          'bg-green-100 text-green-800': user.status === 'active',
                          'bg-yellow-100 text-yellow-800': user.status === 'pending',
                          'bg-red-100 text-red-800': user.status === 'inactive'
                        }">
                          {{ user.status }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="space-y-2">
                          <button 
                            @click="toggleUserStatus(user.username)"
                            :class="{
                              'px-3 py-1 text-sm rounded-md w-full': true,
                              'bg-red-100 text-red-700 hover:bg-red-200': user.status === 'active',
                              'bg-green-100 text-green-700 hover:bg-green-200': user.status === 'inactive'
                            }"
                          >
                            {{ user.status === 'active' ? 'Dar de baja' : 'Activar' }}
                          </button>
                          
                          <button 
                            @click="openUserDetails(user)"
                            class="px-3 py-1 text-sm rounded-md w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Ver detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden shadow-xl transform transition-all">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">
            Detalles del Cliente
          </h3>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span class="sr-only">Cerrar</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div v-if="selectedUser" class="space-y-6">
            <!-- Información Personal -->
            <div class="bg-white rounded-lg">
              <h4 class="text-lg font-medium text-emerald-600 mb-4">Información Personal</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Usuario:</strong> {{ selectedUser.username }}</div>
                <div><strong>Email:</strong> {{ selectedUser.email }}</div>
                <div><strong>Teléfono:</strong> {{ selectedUser.phone }}</div>
              </div>
            </div>

            <!-- Información del Negocio -->
            <div class="bg-white rounded-lg">
              <h4 class="text-lg font-medium text-emerald-600 mb-4">Información del Negocio</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Nombre del Negocio:</strong> {{ selectedUser.businessName }}</div>
                <div><strong>Nombre Legal:</strong> {{ selectedUser.legalName }}</div>
                <div><strong>Tipo de Negocio:</strong> {{ selectedUser.businessType }}</div>
                <div><strong>Sitio Web:</strong> {{ selectedUser.website || 'N/A' }}</div>
                <div><strong>País:</strong> {{ selectedUser.country }}</div>
                <div><strong>ID Fiscal:</strong> {{ selectedUser.taxId }}</div>
              </div>
            </div>

            <!-- Información Bancaria -->
            <div class="bg-white rounded-lg">
              <h4 class="text-lg font-medium text-emerald-600 mb-4">Información Bancaria</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Banco:</strong> {{ selectedUser.bankName }}</div>
                <div><strong>IBAN:</strong> {{ selectedUser.iban }}</div>
                <div><strong>SWIFT:</strong> {{ selectedUser.swift }}</div>
              </div>
            </div>

            <!-- Estado de la Cuenta -->
            <div class="bg-white rounded-lg">
              <h4 class="text-lg font-medium text-emerald-600 mb-4">Estado de la Cuenta</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Rol:</strong> {{ selectedUser.role }}</div>
                <div><strong>Estado:</strong> 
                  <span :class="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-green-100 text-green-800': selectedUser.status === 'active',
                    'bg-yellow-100 text-yellow-800': selectedUser.status === 'pending',
                    'bg-red-100 text-red-800': selectedUser.status === 'inactive'
                  }">
                    {{ selectedUser.status }}
                  </span>
                </div>
                <div><strong>Fecha de Registro:</strong> 
                  {{ selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            @click="closeModal"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>