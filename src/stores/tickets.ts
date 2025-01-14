import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

interface Response {
  id: number
  ticketId: number
  userId: string
  message: string
  createdAt: string
}

interface Ticket {
  id: number
  userId: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
  responses: Response[]
}

interface ApiError {
  message: string
  code?: string
}

interface CreateTicketResponse {
  ticket: Ticket
}

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([])
  const currentTicket = ref<Ticket | null>(null)
  const isLoading = ref(false)
  const lastError = ref<ApiError | null>(null)
  const authStore = useAuthStore()

  async function fetchTickets(): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{tickets: Ticket[]}>('https://api.green-sys.es/tickets', {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      tickets.value = response.data.tickets || []
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

  async function createTicket(data: { title: string, description: string }): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<CreateTicketResponse>('https://api.green-sys.es/tickets', 
        data,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

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

  async function getTicket(id: number): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.get<{ticket: Ticket}>(`https://api.green-sys.es/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      // Actualizar el ticket en la lista local y en currentTicket
      const ticketIndex = tickets.value.findIndex(t => t.id === id)
      if (ticketIndex !== -1) {
        tickets.value[ticketIndex] = response.data.ticket
      }
      currentTicket.value = response.data.ticket

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else if (error.response?.status === 404) {
          lastError.value = { message: 'Ticket no encontrado.' }
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al cargar el ticket.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al cargar el ticket.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateTicketStatus(id: number, status: 'open' | 'in-progress' | 'resolved'): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      await axios.put(`https://api.green-sys.es/tickets/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      // Actualizar el estado del ticket en la lista local
      const ticketIndex = tickets.value.findIndex(t => t.id === id)
      if (ticketIndex !== -1) {
        tickets.value[ticketIndex].status = status
      }
      if (currentTicket.value?.id === id) {
        currentTicket.value.status = status
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else if (error.response?.status === 403) {
          lastError.value = { message: 'No tiene permisos para realizar esta acción.' }
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al actualizar el estado del ticket.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al actualizar el estado del ticket.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function addResponse(ticketId: number, userId: string, message: string): Promise<boolean> {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await axios.post<{response: Response}>(`https://api.green-sys.es/tickets/${ticketId}/responses`, 
        { message },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )

      // Actualizar localmente el ticket con la nueva respuesta
      const ticketIndex = tickets.value.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        if (!tickets.value[ticketIndex].responses) {
          tickets.value[ticketIndex].responses = []
        }
        tickets.value[ticketIndex].responses.push(response.data.response)
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = { message: 'Sesión expirada. Por favor, inicie sesión de nuevo.' }
          authStore.logout()
        } else {
          lastError.value = { 
            message: error.response?.data?.message || 'Error al añadir la respuesta.',
            code: error.response?.data?.code
          }
        }
      } else {
        lastError.value = { message: 'Error inesperado al añadir la respuesta.' }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getTicketsByStatus = computed(() => (status?: 'open' | 'in-progress' | 'resolved') => {
    if (!status) return tickets.value
    return tickets.value.filter(ticket => ticket.status === status)
  })

  const getMyTickets = computed(() => {
    if (!authStore.user?.username) return []
    return tickets.value.filter(ticket => ticket.userId === authStore.user?.username)
  })

  return {
    tickets,
    currentTicket,
    isLoading,
    lastError,
    fetchTickets,
    createTicket,
    getTicket,
    updateTicketStatus,
    getTicketsByStatus,
    getMyTickets,
    addResponse
  }
})