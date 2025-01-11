<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePaymentStore } from '../stores/payment'
import { CreditCard, Phone, Banknote } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

// Estado local
const amount = ref(Number(route.query.amount) || 0)
const selectedMethod = ref<'card' | 'bizum' | 'cash'>('card')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const phone = ref('')
const isProcessing = ref(false)

// Validación de tarjeta
const isCardNumberValid = computed(() => /^[0-9]{16}$/.test(cardNumber.value))
const isCardExpiryValid = computed(() => /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardExpiry.value))
const isCardCvcValid = computed(() => /^[0-9]{3,4}$/.test(cardCvc.value))
const isCardFormValid = computed(() => 
  isCardNumberValid.value && 
  isCardExpiryValid.value && 
  isCardCvcValid.value
)

// Validación de Bizum
const isPhoneValid = computed(() => /^[6-7][0-9]{8}$/.test(phone.value))

// Procesar pago
const processPayment = async () => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    let payment = null

    switch (selectedMethod.value) {
      case 'card':
        if (!isCardFormValid.value) {
          toastr.error('Por favor, complete todos los campos correctamente')
          return
        }
        
        const intent = await paymentStore.createPaymentIntent(amount.value)
        if (intent) {
          payment = await paymentStore.confirmCardPayment(intent.id, {
            number: cardNumber.value,
            expiry: cardExpiry.value,
            cvc: cardCvc.value
          })
        }
        break

      case 'bizum':
        if (!isPhoneValid.value) {
          toastr.error('Por favor, introduzca un número de teléfono válido')
          return
        }
        
        payment = await paymentStore.processBizumPayment(amount.value, phone.value)
        break

      case 'cash':
        payment = await paymentStore.processCashPayment(amount.value)
        break
    }

    if (payment) {
      router.push({
        name: 'payment-success',
        params: { id: payment.id }
      })
    } else if (paymentStore.lastError) {
      toastr.error(paymentStore.lastError.message)
    }
  } catch (error) {
    toastr.error('Error al procesar el pago')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-12">
    <div class="max-w-lg mx-auto px-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Procesar pago</h1>

        <!-- Importe -->
        <div class="mb-8">
          <div class="text-sm font-medium text-gray-700 mb-2">Importe a pagar</div>
          <div class="text-3xl font-bold text-emerald-600">{{ amount.toFixed(2) }}€</div>
        </div>

        <!-- Métodos de pago -->
        <div class="space-y-4 mb-8">
          <button
            v-for="method in ['card', 'bizum', 'cash']"
            :key="method"
            @click="selectedMethod = method"
            class="w-full flex items-center p-4 border rounded-lg"
            :class="[
              selectedMethod === method
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
            ]"
          >
            <CreditCard v-if="method === 'card'" class="h-6 w-6 mr-3" />
            <Phone v-if="method === 'bizum'" class="h-6 w-6 mr-3" />
            <Banknote v-if="method === 'cash'" class="h-6 w-6 mr-3" />
            <span class="font-medium">
              {{ method === 'card' ? 'Tarjeta' : method === 'bizum' ? 'Bizum' : 'Efectivo' }}
            </span>
          </button>
        </div>

        <!-- Formulario de tarjeta -->
        <div v-if="selectedMethod === 'card'" class="space-y-4 mb-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de tarjeta
            </label>
            <input
              v-model="cardNumber"
              type="text"
              maxlength="16"
              class="input-field"
              :class="{ 'border-red-500': cardNumber && !isCardNumberValid }"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Fecha de caducidad
              </label>
              <input
                v-model="cardExpiry"
                type="text"
                maxlength="5"
                class="input-field"
                :class="{ 'border-red-500': cardExpiry && !isCardExpiryValid }"
                placeholder="MM/YY"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                v-model="cardCvc"
                type="text"
                maxlength="4"
                class="input-field"
                :class="{ 'border-red-500': cardCvc && !isCardCvcValid }"
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <!-- Formulario de Bizum -->
        <div v-if="selectedMethod === 'bizum'" class="space-y-4 mb-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Número de teléfono
            </label>
            <input
              v-model="phone"
              type="tel"
              maxlength="9"
              class="input-field"
              :class="{ 'border-red-500': phone && !isPhoneValid }"
              placeholder="612345678"
            />
          </div>
        </div>

        <!-- Botón de pago -->
        <button
          @click="processPayment"
          class="btn-primary w-full"
          :disabled="isProcessing || (selectedMethod === 'card' && !isCardFormValid) || (selectedMethod === 'bizum' && !isPhoneValid)"
        >
          <span v-if="isProcessing">Procesando...</span>
          <span v-else>Pagar {{ amount.toFixed(2) }}€</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500;
}

.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed;
}
</style> 