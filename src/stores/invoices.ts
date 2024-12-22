import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Invoice {
  id: number;
  userId: string;
  number: string;
  date: Date;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  items: InvoiceItem[];
  metadata?: Record<string, any>;
}

interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ApiError {
  message: string;
  code?: string;
}

export const useInvoiceStore = defineStore('invoices', () => {
  const invoices = ref<Invoice[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  // Etiquetas de estado en español
  const statusLabels = {
    pending: 'Pendiente',
    paid: 'Pagada',
    overdue: 'Vencida'
  }

  // Clases de estilo para cada estado
  const statusClasses = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700'
  }

  const fetchInvoices = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{invoices: Invoice[]}>('https://api.green-sys.es/invoices', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      invoices.value = response.data.invoices
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar las facturas.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar las facturas.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const downloadInvoice = async (id: number): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get(`https://api.green-sys.es/invoices/${id}/download`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        responseType: 'blob'
      })

      // Crear un blob con el PDF
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al descargar la factura.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al descargar la factura.' }
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
    statusLabels,
    statusClasses,
    fetchInvoices,
    downloadInvoice
  }
}) 