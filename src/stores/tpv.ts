import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  image?: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface Sale {
  id: number
  items: CartItem[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
  paymentMethod?: string
  reference: string
}

interface ApiError {
  message: string
  code?: string
}

export const useTpvStore = defineStore('tpv', () => {
  const authStore = useAuthStore()
  const products = ref<Product[]>([])
  const cart = ref<CartItem[]>([])
  const currentSale = ref<Sale | null>(null)
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)

  // Productos
  const fetchProducts = async () => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{products: Product[]}>('https://api.green-sys.es/products', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      products.value = response.data.products
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar los productos.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar los productos.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{product: Product}>('https://api.green-sys.es/products', product, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      products.value.push(response.data.product)
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = { 
          message: error.response?.data?.message || 'Error al añadir el producto.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al añadir el producto.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.put<{product: Product}>(`https://api.green-sys.es/products/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = response.data.product
      }
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = { 
          message: error.response?.data?.message || 'Error al actualizar el producto.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al actualizar el producto.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Carrito
  const addToCart = (product: Product, quantity: number = 1) => {
    const existingItem = cart.value.find(item => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.value.push({ product, quantity })
    }
  }

  const removeFromCart = (productId: number) => {
    cart.value = cart.value.filter(item => item.product.id !== productId)
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = cart.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity = quantity
    }
  }

  const clearCart = () => {
    cart.value = []
    currentSale.value = null
  }

  const getCartTotal = () => {
    return cart.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  // Ventas
  const createSale = async (paymentMethod: string) => {
    try {
      isLoading.value = true
      lastError.value = null

      const sale = {
        items: cart.value,
        total: getCartTotal(),
        paymentMethod,
        reference: `SALE-${Date.now()}`
      }

      const response = await axios.post<{sale: Sale}>('https://api.green-sys.es/sales', sale, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      currentSale.value = response.data.sale
      return response.data.sale
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = { 
          message: error.response?.data?.message || 'Error al crear la venta.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al crear la venta.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const completeSale = async (saleId: number) => {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.put(`https://api.green-sys.es/sales/${saleId}/complete`, null, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      if (currentSale.value?.id === saleId) {
        currentSale.value.status = 'completed'
      }
      clearCart()
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = { 
          message: error.response?.data?.message || 'Error al completar la venta.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al completar la venta.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const cancelSale = async (saleId: number) => {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.put(`https://api.green-sys.es/sales/${saleId}/cancel`, null, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      if (currentSale.value?.id === saleId) {
        currentSale.value.status = 'cancelled'
      }
      clearCart()
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = { 
          message: error.response?.data?.message || 'Error al cancelar la venta.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al cancelar la venta.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    cart,
    currentSale,
    isLoading,
    lastError,
    fetchProducts,
    addProduct,
    updateProduct,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    createSale,
    completeSale,
    cancelSale
  }
}) 