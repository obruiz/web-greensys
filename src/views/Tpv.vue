<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, ShieldCheck } from 'lucide-vue-next'

interface Props {
  slug: string
}

interface PaymentData {
  amount: number
  description: string
  reference: string
  status: string
  sandbox: boolean
  metadata: string // URL de callback
}

const props = defineProps<Props>()
const router = useRouter()

const paymentData = ref<PaymentData | null>(null)
const error = ref<string | null>(null)
const isLoading = ref(true)
const isDisabled = ref(false)

// Datos del formulario
const cardNumber = ref(import.meta.env.DEV ? '4111 1111 1111 1111' : '')
const expiry = ref(import.meta.env.DEV ? '12/25' : '')
const cvc = ref(import.meta.env.DEV ? '123' : '')
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
  if (!props.slug) {
    router.push('/')
    return
  }

  try {
    const response = await fetch(`https://api.green-sys.es/sales/${props.slug}`)
    if (!response.ok) {
      throw new Error('Venta no encontrada')
    }

    const data = await response.json()
    paymentData.value = data
    
    // Deshabilitar formulario si la venta no está pendiente
    if (data.status !== 'pending') {
      error.value = 'Esta venta ya no está disponible para pago'
      isDisabled.value = true
    }

    document.title = `Pago de ${data.amount}€ - Green TPV`
  } catch (err) {
    error.value = 'No se pudo cargar la información del pago'
    console.error(err)
  } finally {
    isLoading.value = false
  }
})

const handleSubmit = async () => {
  const validationError = validateForm()
  if (validationError) {
    error.value = validationError
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const response = await fetch('https://api.green-sys.es/payment', {
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
    if (paymentData.value?.metadata) {
      window.location.href = paymentData.value.metadata
    } else {
      router.push('/payment-success')
    }
  } catch (e) {
    error.value = 'Error procesando el pago: ' + (e instanceof Error ? e.message : 'Error desconocido')
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Aviso de sandbox -->
    <div v-if="paymentData?.sandbox" class="max-w-xl mx-auto mb-6">
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <span class="text-yellow-800 text-sm font-medium">
          Modo Sandbox - Pagos de prueba <br>
          Este pago se validará pero no se procesará en el panel de administrador
        </span>
      </div>
    </div>

    <div class="max-w-xl mx-auto">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-medium text-gray-900">
            <template v-if="paymentData">
              {{ paymentData.description }}
            </template>
            <template v-else>
              <div class="animate-pulse bg-gray-200 h-6 w-48 rounded"></div>
            </template>
          </h2>
          <ShieldCheck class="h-6 w-6 text-emerald-500" />
        </div>
        <div v-if="paymentData" class="text-3xl font-bold text-emerald-600">
          {{ paymentData.amount.toFixed(2) }}€
        </div>
      </div>

      <!-- Formulario de pago -->
      <div class="card">
        <!-- Error general -->
        <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex items-center space-x-2">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span class="text-red-800">{{ error }}</span>
          </div>
        </div>

        <form v-if="!error" @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Número de tarjeta -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de tarjeta
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="cardNumber"
                @input="formatCardNumber"
                type="text"
                maxlength="19"
                class="input-field pl-10"
                :class="{'bg-gray-50 cursor-not-allowed': isDisabled}"
                placeholder="4242 4242 4242 4242"
                required
                :disabled="isDisabled"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Fecha de expiración -->
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
                :class="{'bg-gray-50 cursor-not-allowed': isDisabled}"
                placeholder="MM/YY"
                required
                :disabled="isDisabled"
              />
            </div>
            <!-- CVC -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                v-model="cvc"
                type="text"
                maxlength="3"
                class="input-field"
                :class="{'bg-gray-50 cursor-not-allowed': isDisabled}"
                placeholder="123"
                required
                :disabled="isDisabled"
              />
            </div>
          </div>

          <!-- Titular -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Titular de la tarjeta
            </label>
            <input
              v-model="cardholderName"
              type="text"
              class="input-field"
              :class="{'bg-gray-50 cursor-not-allowed': isDisabled}"
              placeholder="NOMBRE APELLIDOS"
              required
              :disabled="isDisabled"
            />
          </div>

          <!-- Botón de pago -->
          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center space-x-2"
            :disabled="isLoading || isDisabled"
          >
            <template v-if="isLoading">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Procesando...</span>
            </template>
            <span v-else>
              {{ paymentData ? `Pagar ${paymentData.amount.toFixed(2)}€` : 'Pago no disponible' }}
            </span>
          </button>

          <!-- Footer -->
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-4">
            <ShieldCheck class="h-4 w-4" />
            <span>Pago seguro con cifrado SSL</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>