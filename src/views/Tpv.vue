<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, ShieldCheck, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

interface Props {
  slug: string
}

interface PaymentData {
  amount: number
  description: string
  merchantName: string
  reference: string
  returnUrl: string
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

// Simulación de pagos de prueba
const MOCK_PAYMENTS: Record<string, PaymentData> = {
  'demo-payment': {
    amount: 29.99,
    description: 'Compra de prueba',
    merchantName: 'Tienda Demo',
    reference: 'DEMO-001',
    returnUrl: '/payment-success'
  }
}

// Valores por defecto para pagos no encontrados
const DEFAULT_PAYMENT: PaymentData = {
  amount: 0,
  description: 'Pago no encontrado',
  merchantName: 'Error',
  reference: '',
  returnUrl: '/payment-error'
}

const loading = ref(true)
const error = ref<string | null>(null)
const paymentData = ref<PaymentData | null>(null)

// Datos del formulario
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const cardholderName = ref('')

// Validaciones
const formatCardNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  const matches = value.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    cardNumber.value = parts.join(' ')
  } else {
    cardNumber.value = target.value
  }
}

const formatExpiry = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  if (value.length >= 2) {
    expiry.value = value.slice(0, 2) + '/' + value.slice(2, 4)
  } else {
    expiry.value = value
  }
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

// Obtener datos del pago
onMounted(async () => {
  try {
    // Si no hay código de venta, redirigir al home
    if (!props.slug) {
      router.push('/')
      return
    }

    loading.value = true
    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Buscar el pago en nuestro mock
    const response = await fetch(`https://api.green-sys.es/sales/${props.slug}`)
    if (!response.ok) {
      paymentData.value = DEFAULT_PAYMENT
      throw new Error('El pago solicitado no existe o ha expirado')
    }
    
    const data = await response.json()
    paymentData.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error desconocido'
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true
  error.value = null

  try {
    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const response = await fetch('https://api.green-sys.es/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sale_id: props.slug,
        cardNumber: cardNumber.value.replace(/\s+/g, ''),
        expiry: expiry.value,
        cvc: cvc.value,
        cardholderName: cardholderName.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Error procesando el pago')
    }

    // Si todo OK, redirigir
    if (paymentData.value?.returnUrl.startsWith('http')) {
      window.location.href = paymentData.value.returnUrl
    } else {
      router.push(paymentData.value?.returnUrl || '/payment-success')
    }
  } catch (e) {
    error.value = 'Error procesando el pago: ' + (e instanceof Error ? e.message : 'Error desconocido')
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

      <!-- Payment Form -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Header -->
        <div class="bg-emerald-500 px-6 py-4">
          <div class="flex justify-between items-center">
            <h1 class="text-xl font-bold text-white">
              {{ paymentData?.merchantName || 'Error' }}
            </h1>
            <ShieldCheck class="h-6 w-6 text-white" />
          </div>
        </div>

        <!-- Payment Details -->
        <div class="p-6">
          <!-- Error Message -->
          <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center space-x-2">
              <AlertCircle class="h-5 w-5 text-red-500" />
              <span class="text-red-800">{{ error }}</span>
            </div>
          </div>

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
                  @input="formatCardNumber"
                  type="text"
                  maxlength="19"
                  class="input-field pl-10"
                  :class="{'bg-gray-100': !MOCK_PAYMENTS[props.slug]}"
                  placeholder="1234 5678 9012 3456"
                  required
                  :disabled="!MOCK_PAYMENTS[props.slug]"
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
                  @input="formatExpiry"
                  type="text"
                  maxlength="5"
                  class="input-field"
                  :class="{'bg-gray-100': !MOCK_PAYMENTS[props.slug]}"
                  placeholder="MM/YY"
                  required
                  :disabled="!MOCK_PAYMENTS[props.slug]"
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
                  :class="{'bg-gray-100': !MOCK_PAYMENTS[props.slug]}"
                  placeholder="123"
                  required
                  :disabled="!MOCK_PAYMENTS[props.slug]"
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
                :class="{'bg-gray-100': !MOCK_PAYMENTS[props.slug]}"
                placeholder="NOMBRE APELLIDOS"
                required
                :disabled="!MOCK_PAYMENTS[props.slug]"
              />
            </div>

            <button
              type="submit"
              class="btn-primary w-full flex items-center justify-center"
              :disabled="loading || !MOCK_PAYMENTS[props.slug]"
            >
              <span v-if="loading">Procesando...</span>
              <span v-else>{{ MOCK_PAYMENTS[props.slug] ? `Pagar ${paymentData?.amount.toFixed(2)}€` : 'Pago no disponible' }}</span>
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