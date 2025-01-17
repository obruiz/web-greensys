import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Invoice {
  apartado: string | null
  ciudad: string
  codagente: string | null
  codcliente: string
  codigoenv: string
  codpais: string
  codpostal: string | null
  codtrans: string | null
  direccion: string
  idcontactoenv: number | null
  idcontactofact: number
  nombrecliente: string
  numero2: string
  provincia: string
  totalbeneficio: number
  totalcoste: number
  editable: boolean
  idestado: number
  cifnif: string
  codalmacen: string
  codigo: string
  dtopor1: number
  dtopor2: number
  fecha: string
  femail: string | null
  hora: string
  irpf: number
  neto: number
  netosindto: number
  nick: string | null
  numero: string
  numdocs: number
  observaciones: string
  total: number
  totaliva: number
  totaleuros: number
  totalirpf: number
  totalrecargo: number
  totalsuplidos: number
  idempresa: number
  coddivisa: string
  tasaconv: number
  codejercicio: string
  codpago: string
  codserie: string
  operacion: string
  codigorect: string | null
  fechadevengo: string | null
  idfactura: number
  idfacturarect: number | null
  pagada: boolean
  vencida: boolean
  idasiento: number | null
  fecha_creacion: string
  excluir347: boolean
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

      invoices.value = response.data.beplyData
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

  async function downloadInvoicePDF(id: number) {
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

      const response = await axios.get(`https://api.green-sys.es/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/pdf'
        },
        responseType: 'blob'
      })

      // Crear un blob con el PDF
      const blob = new Blob([response.data], { type: 'application/pdf' })
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob)
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${id}.pdf`
      
      // Agregar al DOM y simular click
      document.body.appendChild(link)
      link.click()
      
      // Limpiar
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

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
            message: error.response?.data?.message || 'Error al descargar la factura'
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
    fetchInvoices,
    downloadInvoicePDF
  }
}) 