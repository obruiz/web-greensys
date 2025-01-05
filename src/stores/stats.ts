import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { useAuthStore } from './auth'

interface Stats {
  clientesTotales: number
  ticketsActivos: number
  ingresosNetos: number
  comisionesTotales: number
  comisionesPorcentaje: string
}

interface StatsError {
  message: string
  code?: string
}

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<Stats | null>(null)
  const isLoading = ref(false)
  const lastError = ref<StatsError | null>(null)
  const authStore = useAuthStore()

  async function fetchStats(): Promise<boolean> {
    isLoading.value = true
    lastError.value = null

    try {
      const response = await axios.get('https://api.green-sys.es/stats', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      stats.value = response.data.stats
      return true
    } catch (error: any) {
      lastError.value = {
        message: error.response?.data?.message || 'Error al cargar las estadísticas',
        code: error.response?.status?.toString()
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    stats,
    isLoading,
    lastError,
    fetchStats
  }
}) 