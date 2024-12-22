import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Ticket {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: number;
  ticketId: number;
  userId: string;
  message: string;
  createdAt: Date;
  isStaff: boolean;
}

interface ApiError {
  message: string;
  code?: string;
}

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  // Etiquetas de estado en español
  const statusLabels = {
    'open': 'Abierto',
    'in-progress': 'En Proceso',
    'resolved': 'Resuelto'
  }

  // Clases de estilo para cada estado
  const statusClasses = {
    'open': 'bg-blue-50 text-blue-700',
    'in-progress': 'bg-yellow-50 text-yellow-700',
    'resolved': 'bg-emerald-50 text-emerald-700'
  }

  // Obtener solo los tickets del usuario actual
  const getMyTickets = computed(() => 
    tickets.value.filter(ticket => ticket.userId === authStore.user?.username)
  )

  const fetchTickets = async (): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{tickets: Ticket[]}>('https://api.green-sys.es/tickets', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      tickets.value = response.data.tickets
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar los tickets.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar los tickets.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const createTicket = async (ticketData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{ticket: Ticket}>('https://api.green-sys.es/tickets', ticketData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      tickets.value.push(response.data.ticket)
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al crear el ticket.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al crear el ticket.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const addMessage = async (ticketId: number, message: string): Promise<boolean> => {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{message: TicketMessage}>(
        `https://api.green-sys.es/tickets/${ticketId}/messages`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      const ticketIndex = tickets.value.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        tickets.value[ticketIndex].messages.push(response.data.message)
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al añadir el mensaje.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al añadir el mensaje.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    tickets,
    isLoading,
    lastError,
    statusLabels,
    statusClasses,
    getMyTickets,
    fetchTickets,
    createTicket,
    addMessage
  }
}) 