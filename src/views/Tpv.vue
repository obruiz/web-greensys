<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTpvStore } from '../stores/tpv'
import { useAuthStore } from '../stores/auth'
import { Plus, Minus, Trash2, CreditCard, Banknote, QrCode } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const tpvStore = useTpvStore()
const authStore = useAuthStore()

// Estado local
const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const showPaymentModal = ref(false)

// Productos filtrados
const filteredProducts = computed(() => {
  let filtered = tpvStore.products
  
  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Categorías únicas
const categories = computed(() => {
  const uniqueCategories = new Set(tpvStore.products.map(p => p.category))
  return Array.from(uniqueCategories)
})

// Cargar productos al montar
onMounted(async () => {
  const success = await tpvStore.fetchProducts()
  if (!success && tpvStore.lastError) {
    toastr.error(tpvStore.lastError.message)
  }
})

// Métodos del carrito
const addToCart = (product: any) => {
  if (product.stock > 0) {
    tpvStore.addToCart(product)
    toastr.success('Producto añadido al carrito')
  } else {
    toastr.error('Producto sin stock')
  }
}

const removeFromCart = (productId: number) => {
  tpvStore.removeFromCart(productId)
  toastr.success('Producto eliminado del carrito')
}

const updateQuantity = (productId: number, quantity: number) => {
  const item = tpvStore.cart.find(item => item.product.id === productId)
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else if (quantity <= item.product.stock) {
      tpvStore.updateQuantity(productId, quantity)
    } else {
      toastr.error('Stock insuficiente')
    }
  }
}

// Procesar pago
const processSale = async (paymentMethod: string) => {
  if (tpvStore.cart.length === 0) {
    toastr.error('El carrito está vacío')
    return
  }

  const sale = await tpvStore.createSale(paymentMethod)
  if (sale) {
    showPaymentModal.value = false
    toastr.success('Venta procesada correctamente')
    await tpvStore.completeSale(sale.id)
  } else if (tpvStore.lastError) {
    toastr.error(tpvStore.lastError.message)
  }
}

const cancelCurrentSale = async () => {
  if (tpvStore.currentSale) {
    const success = await tpvStore.cancelSale(tpvStore.currentSale.id)
    if (success) {
      showPaymentModal.value = false
      toastr.success('Venta cancelada')
    } else if (tpvStore.lastError) {
      toastr.error(tpvStore.lastError.message)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-12 gap-6">
        <!-- Productos -->
        <div class="col-span-8">
          <div class="bg-white rounded-lg shadow p-6">
            <!-- Búsqueda y filtros -->
            <div class="mb-6 space-y-4">
              <input
                v-model="searchQuery"
                type="text"
                class="input-field"
                placeholder="Buscar productos..."
              />
              
              <div class="flex flex-wrap gap-2">
                <button
                  @click="selectedCategory = null"
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    !selectedCategory 
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  ]"
                >
                  Todos
                </button>
                <button
                  v-for="category in categories"
                  :key="category"
                  @click="selectedCategory = category"
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    selectedCategory === category
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  ]"
                >
                  {{ category }}
                </button>
              </div>
            </div>

            <!-- Grid de productos -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <button
                v-for="product in filteredProducts"
                :key="product.id"
                @click="addToCart(product)"
                class="p-4 border rounded-lg hover:shadow-md transition-shadow text-left"
                :class="[
                  product.stock > 0
                    ? 'border-gray-200 hover:border-emerald-500'
                    : 'border-red-200 bg-red-50 cursor-not-allowed'
                ]"
              >
                <div v-if="product.image" class="aspect-square mb-2">
                  <img 
                    :src="product.image" 
                    :alt="product.name"
                    class="w-full h-full object-cover rounded"
                  />
                </div>
                <div v-else class="aspect-square mb-2 bg-gray-100 rounded flex items-center justify-center">
                  <span class="text-gray-400">Sin imagen</span>
                </div>
                
                <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
                <div class="mt-1 text-sm text-gray-500">{{ product.category }}</div>
                <div class="mt-2 font-bold text-emerald-600">{{ product.price.toFixed(2) }}€</div>
                <div class="mt-1 text-sm" :class="[
                  product.stock > 0 ? 'text-emerald-600' : 'text-red-600'
                ]">
                  Stock: {{ product.stock }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Carrito -->
        <div class="col-span-4">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Carrito</h2>

            <div v-if="tpvStore.cart.length === 0" class="text-center py-8 text-gray-500">
              El carrito está vacío
            </div>

            <div v-else class="space-y-4">
              <!-- Items del carrito -->
              <div v-for="item in tpvStore.cart" :key="item.product.id" class="flex items-center space-x-4">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ item.product.name }}</div>
                  <div class="text-sm text-gray-500">{{ item.product.price.toFixed(2) }}€</div>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    @click="updateQuantity(item.product.id, item.quantity - 1)"
                    class="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus class="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <span class="w-8 text-center">{{ item.quantity }}</span>
                  
                  <button
                    @click="updateQuantity(item.product.id, item.quantity + 1)"
                    class="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus class="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    @click="removeFromCart(item.product.id)"
                    class="p-1 rounded-full hover:bg-red-100"
                  >
                    <Trash2 class="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>

              <!-- Total -->
              <div class="border-t pt-4 mt-4">
                <div class="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span class="text-emerald-600">{{ tpvStore.getCartTotal().toFixed(2) }}€</span>
                </div>
              </div>

              <!-- Botones de acción -->
              <div class="space-y-2">
                <button
                  @click="showPaymentModal = true"
                  class="btn-primary w-full"
                >
                  Procesar pago
                </button>
                <button
                  @click="tpvStore.clearCart()"
                  class="btn-secondary w-full"
                >
                  Limpiar carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de pago -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Seleccionar método de pago</h2>

        <div class="space-y-4">
          <button
            @click="processSale('card')"
            class="btn-payment"
          >
            <CreditCard class="h-6 w-6" />
            <span>Tarjeta</span>
          </button>

          <button
            @click="processSale('cash')"
            class="btn-payment"
          >
            <Banknote class="h-6 w-6" />
            <span>Efectivo</span>
          </button>

          <button
            @click="processSale('bizum')"
            class="btn-payment"
          >
            <QrCode class="h-6 w-6" />
            <span>Bizum</span>
          </button>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="showPaymentModal = false"
            class="btn-secondary"
          >
            Cancelar
          </button>
        </div>
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

.btn-secondary {
  @apply inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed;
}

.btn-payment {
  @apply flex items-center space-x-3 w-full p-4 rounded-lg border border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2;
}
</style> 