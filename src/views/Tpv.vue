<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useSalesStore } from '../stores/sales'

interface Props {
  slug: string
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()
const salesStore = useSalesStore()

const loading = ref(true)
const error = ref<string | null>(null)
const paymentData = ref<{
  amount: number
  description: string
  merchantName: string
  reference: string
} | null>(null)

// Datos del formulario
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const cardholderName = ref('')

// Validaciones
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = v.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

const formatExpiry = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (v.length >= 2) {
    return v.slice(0, 2) + '/' + v.slice(2, 4)
  }
  return v
}

const validateForm = () => {
  if (cardNumber.value.replace(/\s+/g, '').length !== 16) {
    return 'Número de tarjeta inválido'
  }
  if (expiry.value.length !== 5) {
    return 'Fecha de expiración inválida'
  }
  if (cvc.value.length !== 3) {
    return 'CVC inválido'
  }
  if (cardholderName.value.length < 3) {
    return 'Nombre del titular requerido'
  }
  return null
}

// Simular carga de datos del pago
onMounted(async () => {
  try {
    // Aquí iría la llamada real a tu API
    const response = await simulateApiCall()
    if (!response) {
      throw new Error('Pago no encontrado')
    }
    paymentData.value = response
    loading.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error desconocido'
    loading.value = false
  }
})

// Simulación de API con modo sandbox
const simulateApiCall = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (authStore.isSandboxMode) {
        // Datos de prueba en sandbox
        resolve({
          amount: 99.99,
          description: 'Pago de prueba (SANDBOX)',
          merchantName: 'Comercio Demo',
          reference: 'SANDBOX-001'
        })
      } else {
        // Lógica real de producción
        if (props.slug === 'demo-payment') {
          resolve({
            amount: 99.99,
            description: 'Pago real',
            merchantName: 'Comercio Real',
            reference: 'PROD-001'
          })
        } else {
          reject(new Error('Pago no encontrado'))
        }
      }
    }, 1000)
  })
}

const handleSubmit = async () => {
  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true
  error.value = null

  try {
    // Crear la venta con estado pendiente
    const sale = salesStore.createSale({
      userId: paymentData.value?.merchantId || '',
      amount: paymentData.value?.amount || 0,
      description: paymentData.value?.description || '',
      reference: paymentData.value?.reference || '',
      status: 'pending',
      paymentMethod: 'card',
      metadata: {
        customerName: cardholderName.value
      }
    })

    // Simular procesamiento del pago
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Actualizar estado a pagado
    salesStore.updateSaleStatus(sale.id, 'paid')

    router.push({
      path: '/payment-success',
      query: { reference: sale.reference }
    })
  } catch (e) {
    error.value = 'Error procesando el pago. Por favor, inténtalo de nuevo.'
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Indicador de modo sandbox -->
    <div v-if="authStore.isSandboxMode" 
         class="max-w-xl mx-auto mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
      <span class="text-yellow-800 text-sm font-medium">
        Modo Sandbox Activo - Pagos de Prueba
      </span>
    </div>
    
    <div class="max-w-xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Cargando información del pago...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow p-6 text-center">
        <AlertCircle class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-gray-900 mb-2">Error</h2>
        <p class="text-gray-600">{{ error }}</p>
        <button @click="router.push('/')" class="btn-primary mt-6">
          Volver al inicio
        </button>
      </div>

      <!-- Payment Form -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Header -->
        <div class="bg-emerald-500 px-6 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-white">
              {{ paymentData?.merchantName }}
            </h1>
            <ShieldCheck class="h-6 w-6 text-white" />
          </div>
        </div>

        <!-- Payment Details -->
        <div class="p-6">
          <div class="mb-6">
            <div class="text-sm text-gray-600">Importe a pagar</div>
            <div class="text-3xl font-bold text-gray-900">
              {{ paymentData?.amount.toFixed(2) }}€
            </div>
            <div class="text-sm text-gray-600 mt-1">
              {{ paymentData?.description }}
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Número de tarjeta
              </label>
              <div class="relative">
                <input
                  v-model="cardNumber"
                  @input="cardNumber = formatCardNumber($event.target.value)"
                  type="text"
                  maxlength="19"
                  class="input-field pl-10"
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <CreditCard class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de expiración
                </label>
                <input
                  v-model="expiry"
                  @input="expiry = formatExpiry($event.target.value)"
                  type="text"
                  maxlength="5"
                  class="input-field"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <input
                  v-model="cvc"
                  type="text"
                  maxlength="3"
                  class="input-field"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Titular de la tarjeta
              </label>
              <input
                v-model="cardholderName"
                type="text"
                class="input-field"
                placeholder="NOMBRE APELLIDOS"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-primary w-full flex items-center justify-center"
              :disabled="loading"
            >
              <span v-if="loading">Procesando...</span>
              <span v-else>Pagar {{ paymentData?.amount.toFixed(2) }}€</span>
            </button>
          </form>

          <div class="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <ShieldCheck class="h-4 w-4" />
            <span>Pago seguro con cifrado SSL</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>