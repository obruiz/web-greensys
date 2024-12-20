<script setup lang="ts">
import { useInvoiceStore } from '../stores/invoices'
import toastr from '../toastrConfig'

const invoiceStore = useInvoiceStore()

const handleDownload = async (id: number) => {
  const success = await invoiceStore.downloadInvoice(id)
  
  if (!success && invoiceStore.lastError) {
    toastr.error(invoiceStore.lastError.message)
  }
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-if="invoiceStore.isLoading">
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
              Cargando facturas...
            </td>
          </tr>
        </template>
        <template v-else-if="invoiceStore.invoices.length === 0">
          <tr>
            <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
              No hay facturas para mostrar
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="invoice in invoiceStore.invoices" :key="invoice.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.number }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(invoice.date).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ invoice.amount.toFixed(2) }}€
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', invoiceStore.statusClasses[invoice.status]]">
                {{ invoiceStore.statusLabels[invoice.status] }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button 
                @click="handleDownload(invoice.id)"
                class="text-emerald-600 hover:text-emerald-900"
                :disabled="invoiceStore.isLoading"
              >
                Descargar PDF
              </button>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template> 