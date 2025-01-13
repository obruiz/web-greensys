<script setup lang="ts">
import { useInvoiceStore } from '../stores/invoices'
import { useAuthStore } from '../stores/auth'
import { Receipt, Download } from 'lucide-vue-next'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'Pagada'
    case 'pending':
      return 'Pendiente'
    case 'overdue':
      return 'Vencida'
    default:
      return status
  }
}
</script>

<template>
  <div v-if="invoiceStore.isLoading" class="text-center py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
    <p class="mt-2 text-sm text-gray-500">Cargando facturas...</p>
  </div>

  <div v-else-if="invoiceStore.lastError" class="p-4 bg-red-50 text-red-700 rounded-lg">
    {{ invoiceStore.lastError.message }}
  </div>

  <div v-else-if="invoiceStore.invoices.length === 0" class="text-center py-8">
    <Receipt class="h-12 w-12 text-gray-400 mx-auto mb-3" />
    <h3 class="text-sm font-medium text-gray-900">No hay facturas</h3>
    <p class="mt-1 text-sm text-gray-500">
      No se han encontrado facturas en tu cuenta.
    </p>
  </div>

  <div v-else class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Referencia
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de emisión
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha de vencimiento
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Importe
          </th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Estado
          </th>
          <th v-if="authStore.isAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cliente
          </th>
          <th scope="col" class="relative px-6 py-3">
            <span class="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="invoice in invoiceStore.invoices" :key="invoice.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ invoice.reference }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(invoice.issuedDate) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(invoice.dueDate) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatAmount(invoice.amount) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(invoice.status)]">
              {{ getStatusText(invoice.status) }}
            </span>
          </td>
          <td v-if="authStore.isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ invoice.userId }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button 
              class="text-emerald-600 hover:text-emerald-900 inline-flex items-center space-x-1"
              @click=""
            >
              <Download class="h-4 w-4" />
              <span>Descargar</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template> 