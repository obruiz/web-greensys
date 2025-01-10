import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Invoice {
  id: string
  userId: string
  amount: number
  status: string
  issuedDate: string
  dueDate: string
  paymentDate: string | null
  description: string
  reference: string
  createdAt: string
  updatedAt: string
}

interface InvoiceError {
  code: 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_CREDENTIALS'
  message: string
}

export const useInvoiceStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)
  const lastError = ref<InvoiceError | null>(null)
  const authStore = useAuthStore()

  async function fetchInvoices() {
    try {
      if (!authStore.token) {
        lastError.value = {
          code: 'INVALID_CREDENTIALS',
          message: 'No hay sesión activa'
        }
        return false
      }

      isLoading.value = true
      lastError.value = null

      const response = await axios.get('https://api.green-sys.es/invoices', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      invoices.value = response.data.invoices
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = {
            code: 'INVALID_CREDENTIALS',
            message: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
          }
          authStore.logout()
        } else {
          lastError.value = {
            code: 'SERVER_ERROR',
            message: error.response?.data?.message || 'Error al obtener las facturas'
          }
        }
      } else {
        lastError.value = {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    invoices,
    isLoading,
    lastError,
    fetchInvoices
  }
}) 