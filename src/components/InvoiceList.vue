<script setup lang="ts">
import { useInvoiceStore } from '../stores/invoices'
import { Download } from 'lucide-vue-next'
import { ref } from 'vue'

const invoiceStore = useInvoiceStore()
const downloadingInvoiceId = ref<number | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString.split('-').reverse().join('-')).toLocaleDateString('es-ES', {
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

const getStatusColor = (pagada: boolean, vencida: boolean) => {
  if (pagada) return 'bg-green-100 text-green-800'
  if (vencida) return 'bg-red-100 text-red-800'
  return 'bg-yellow-100 text-yellow-800'
}

const getStatusText = (pagada: boolean, vencida: boolean) => {
  if (pagada) return 'Pagada'
  if (vencida) return 'Vencida'
  return 'Pendiente'
}

const handleDownload = async (id: number) => {
  downloadingInvoiceId.value = id
  try {
    await invoiceStore.downloadInvoicePDF(id)
  } catch (error) {
    console.error('Error al descargar la factura:', error)
  } finally {
    downloadingInvoiceId.value = null
  }
}
</script>

<template>
  <div>
    <div v-if="invoiceStore.isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-500">Cargando facturas...</p>
    </div>

    <div v-else-if="invoiceStore.lastError" class="p-4 bg-red-50 text-red-700 rounded-lg">
      {{ invoiceStore.lastError.message }}
    </div>

    <div v-else-if="invoiceStore.invoices.length === 0" class="text-center py-8 text-gray-500">
      <p class="text-lg">No hay facturas disponibles</p>
      <p class="text-sm mt-2">Las facturas aparecerán aquí cuando realices transacciones.</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Base Imponible
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IVA
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in invoiceStore.invoices" :key="invoice.idfactura">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ invoice.codigo }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(invoice.fecha) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ invoice.nombrecliente }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatAmount(invoice.neto) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatAmount(invoice.totaliva) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatAmount(invoice.total) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusColor(invoice.pagada, invoice.vencida)]">
                {{ getStatusText(invoice.pagada, invoice.vencida) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                class="text-emerald-600 hover:text-emerald-900 inline-flex items-center space-x-1"
                @click="handleDownload(invoice.idfactura)"
                :disabled="downloadingInvoiceId === invoice.idfactura"
              >
                <Download class="h-4 w-4" :class="{ 'animate-spin': downloadingInvoiceId === invoice.idfactura }" />
                <span>{{ downloadingInvoiceId === invoice.idfactura ? 'Descargando...' : 'Descargar' }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template> 