import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Payment {
  id: number
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  method: 'card' | 'cash' | 'bizum'
  reference: string
  createdAt: Date
  completedAt?: Date
  metadata?: {
    cardLast4?: string
    cardBrand?: string
    errorCode?: string
    errorMessage?: string
  }
}

interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: Payment['status']
}

interface ApiError {
  message: string
  code?: string
}

export const usePaymentStore = defineStore('payment', () => {
  const authStore = useAuthStore()
  const currentPayment = ref<Payment | null>(null)
  const paymentIntent = ref<PaymentIntent | null>(null)
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)

  // Crear intento de pago
  const createPaymentIntent = async (amount: number, currency: string = 'EUR') => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{paymentIntent: PaymentIntent}>(
        'https://api.green-sys.es/payments/intent',
        { amount, currency },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      paymentIntent.value = response.data.paymentIntent
      return response.data.paymentIntent
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = {
            message: error.response?.data?.message || 'Error al crear el intento de pago.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al crear el intento de pago.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Confirmar pago con tarjeta
  const confirmCardPayment = async (paymentIntentId: string, paymentMethodId: string) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{payment: Payment}>(
        `https://api.green-sys.es/payments/intent/${paymentIntentId}/confirm`,
        { paymentMethodId },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      currentPayment.value = response.data.payment
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = {
          message: error.response?.data?.message || 'Error al procesar el pago.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al procesar el pago.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Procesar pago en efectivo
  const processCashPayment = async (amount: number) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{payment: Payment}>(
        'https://api.green-sys.es/payments/cash',
        { amount },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      currentPayment.value = response.data.payment
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = {
          message: error.response?.data?.message || 'Error al procesar el pago en efectivo.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al procesar el pago en efectivo.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Procesar pago con Bizum
  const processBizumPayment = async (amount: number, phone: string) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{payment: Payment}>(
        'https://api.green-sys.es/payments/bizum',
        { amount, phone },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      currentPayment.value = response.data.payment
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = {
          message: error.response?.data?.message || 'Error al procesar el pago con Bizum.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al procesar el pago con Bizum.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Reembolsar pago
  const refundPayment = async (paymentId: number, amount?: number) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{payment: Payment}>(
        `https://api.green-sys.es/payments/${paymentId}/refund`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      if (currentPayment.value?.id === paymentId) {
        currentPayment.value = response.data.payment
      }
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = {
          message: error.response?.data?.message || 'Error al reembolsar el pago.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al reembolsar el pago.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Obtener estado del pago
  const getPaymentStatus = async (paymentId: number) => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{payment: Payment}>(
        `https://api.green-sys.es/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      if (currentPayment.value?.id === paymentId) {
        currentPayment.value = response.data.payment
      }
      return response.data.payment
    } catch (error) {
      if (axios.isAxiosError(error)) {
        lastError.value = {
          message: error.response?.data?.message || 'Error al obtener el estado del pago.',
          code: error.response?.data?.code
        }
      } else {
        lastError.value = { message: 'Error inesperado al obtener el estado del pago.' }
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentPayment,
    paymentIntent,
    isLoading,
    lastError,
    createPaymentIntent,
    confirmCardPayment,
    processCashPayment,
    processBizumPayment,
    refundPayment,
    getPaymentStatus
  }
}) 