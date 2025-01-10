import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCommissionStore } from './commissions'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Sale {
  id: number;
  userId: string;
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  commission: {
    percentage: number;
    amount: number;
    total: number;
  };
}

interface ApiError {
  message: string;
  code?: string;
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  // Etiquetas de estado en español
  const statusLabels = {
    pending: 'Pendiente de pago',
    paid: 'Pagada',
    failed: 'Fallida',
    refunded: 'Reembolsada',
    cancelled: 'Cancelada'
  }

  // Clases de estilo para cada estado
  const statusClasses = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-purple-50 text-purple-700',
    cancelled: 'bg-gray-50 text-gray-700'
  }

  const fetchSales = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{sales: Sale[]}>('https://api.green-sys.es/sales', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      sales.value = response.data.sales
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar las ventas.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar las ventas.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refundSale = async (saleId: number): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.put(`https://api.green-sys.es/sales/${saleId}`, 
        { status: 'refunded' },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      if (response.status === 200) {
        // Actualizar el estado de la venta localmente
        const saleIndex = sales.value.findIndex(s => s.id === saleId)
        if (saleIndex !== -1) {
          sales.value[saleIndex].status = 'refunded'
        }
        return true
      }
      return false
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al reembolsar la venta.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al reembolsar la venta.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getSalesByUser = (userId: string) => sales.value.filter(sale => sale.userId === userId)

  return {
    sales,
    isLoading,
    lastError,
    statusLabels,
    statusClasses,
    fetchSales,
    refundSale,
    getSalesByUser
  }
}) 