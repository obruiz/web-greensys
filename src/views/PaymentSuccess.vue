<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '../stores/payment'
import { CheckCircle, XCircle, ArrowLeft, Loader } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const payment = ref(null)
const isLoading = ref(true)

// Cargar detalles del pago
onMounted(async () => {
  const paymentId = Number(route.params.id)
  if (!paymentId) {
    router.push('/')
    return
  }

  const result = await paymentStore.getPaymentStatus(paymentId)
  if (result) {
    payment.value = result
  } else if (paymentStore.lastError) {
    toastr.error(paymentStore.lastError.message)
  }
  isLoading.value = false
})

// Formatear fecha
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Volver
const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="max-w-lg mx-auto px-4">
      <!-- Loading -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow p-8 text-center">
        <Loader class="h-12 w-12 mx-auto mb-4 text-emerald-600 animate-spin" />
        <p class="text-gray-600">Cargando detalles del pago...</p>
      </div>

      <!-- Error -->
      <div v-else-if="!payment" class="bg-white rounded-lg shadow p-8 text-center">
        <XCircle class="h-12 w-12 mx-auto mb-4 text-red-600" />
        <h2 class="text-xl font-bold text-gray-900 mb-2">Error al cargar el pago</h2>
        <p class="text-gray-600 mb-6">No se ha podido cargar la información del pago.</p>
        <button @click="goBack" class="btn-primary">
          <ArrowLeft class="h-5 w-5 mr-2" />
          Volver al inicio
        </button>
      </div>

      <!-- Éxito -->
      <div v-else class="bg-white rounded-lg shadow p-8">
        <div class="text-center mb-8">
          <CheckCircle 
            class="h-12 w-12 mx-auto mb-4"
            :class="[
              payment.status === 'completed' ? 'text-emerald-600' :
              payment.status === 'processing' ? 'text-yellow-600' :
              payment.status === 'failed' ? 'text-red-600' :
              'text-gray-600'
            ]"
          />
          <h2 class="text-xl font-bold text-gray-900 mb-2">
            {{ 
              payment.status === 'completed' ? '¡Pago completado!' :
              payment.status === 'processing' ? 'Pago en proceso' :
              payment.status === 'failed' ? 'Error en el pago' :
              payment.status === 'refunded' ? 'Pago reembolsado' :
              'Estado desconocido'
            }}
          </h2>
          <p class="text-gray-600">
            {{ 
              payment.status === 'completed' ? 'El pago se ha procesado correctamente.' :
              payment.status === 'processing' ? 'El pago está siendo procesado.' :
              payment.status === 'failed' ? 'Ha ocurrido un error al procesar el pago.' :
              payment.status === 'refunded' ? 'El pago ha sido reembolsado.' :
              'Estado del pago desconocido.'
            }}
          </p>
        </div>

        <div class="border-t border-gray-200 pt-6 space-y-4">
          <!-- Detalles del pago -->
          <div class="flex justify-between">
            <span class="text-gray-600">Referencia</span>
            <span class="font-medium text-gray-900">{{ payment.reference }}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600">Importe</span>
            <span class="font-medium text-gray-900">{{ payment.amount.toFixed(2) }}€</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600">Método</span>
            <span class="font-medium text-gray-900">
              {{ 
                payment.method === 'card' ? 'Tarjeta' :
                payment.method === 'bizum' ? 'Bizum' :
                payment.method === 'cash' ? 'Efectivo' :
                payment.method
              }}
            </span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-600">Fecha</span>
            <span class="font-medium text-gray-900">{{ formatDate(payment.createdAt) }}</span>
          </div>

          <!-- Detalles adicionales para pagos con tarjeta -->
          <template v-if="payment.method === 'card' && payment.metadata">
            <div v-if="payment.metadata.cardLast4" class="flex justify-between">
              <span class="text-gray-600">Tarjeta</span>
              <span class="font-medium text-gray-900">
                •••• {{ payment.metadata.cardLast4 }}
                <span v-if="payment.metadata.cardBrand" class="ml-1 text-gray-500">
                  ({{ payment.metadata.cardBrand }})
                </span>
              </span>
            </div>
          </template>

          <!-- Mensaje de error si existe -->
          <div v-if="payment.status === 'failed' && payment.metadata?.errorMessage" class="mt-4 p-4 bg-red-50 rounded-md">
            <p class="text-sm text-red-700">{{ payment.metadata.errorMessage }}</p>
          </div>
        </div>

        <div class="mt-8">
          <button @click="goBack" class="btn-primary w-full">
            <ArrowLeft class="h-5 w-5 mr-2" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center items-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2;
}
</style> 