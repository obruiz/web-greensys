<script setup lang="ts">
import { ref } from 'vue'
import { CreditCard } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')

const handleSubmit = () => {
  // In a real app, this would process the payment
  console.log('Processing payment...')
  router.push('/client')
}
</script>

<template>
  <section class="py-12">
    <div class="max-w-3xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">Pago Seguro</h1>
      <div class="card">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Completa tu compra</h2>
          <div class="flex items-center space-x-2">
            <CreditCard class="h-5 w-5 text-emerald-500" />
            <span class="text-sm text-gray-600">Pago seguro</span>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-4">
            <form @submit.prevent="handleSubmit">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                <input 
                  v-model="cardNumber"
                  type="text" 
                  class="input-field"
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
                  <input 
                    v-model="expiry"
                    type="text" 
                    class="input-field"
                    placeholder="MM/AA"
                    required
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input 
                    v-model="cvc"
                    type="text" 
                    class="input-field"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <button type="submit" class="btn-primary w-full">
                Pagar ahora
              </button>
            </form>
          </div>
          
          <div class="bg-gray-50 p-6 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen del Pedido</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">$99.00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Impuestos</span>
                <span class="font-medium">$9.90</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex justify-between">
                  <span class="font-medium">Total</span>
                  <span class="font-medium">$108.90</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>