import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Ticket {
  id: number;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  responses: TicketResponse[];
}

interface TicketResponse {
  id: number;
  ticketId: number;
  userId: string;
  message: string;
  createdAt: Date;
}

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref<Ticket[]>([
    {
      id: 1,
      userId: 'client',
      title: 'Problema Técnico',
      description: 'Tengo un problema con el sistema',
      status: 'in-progress',
      createdAt: new Date('2024-03-12'),
      responses: []
    },
    {
      id: 2,
      userId: 'client',
      title: 'Pregunta de Facturación',
      description: 'Necesito ayuda con mi factura',
      status: 'resolved',
      createdAt: new Date('2024-03-09'),
      responses: []
    }
  ])

  function createTicket(userId: string, title: string, description: string) {
    const newTicket: Ticket = {
      id: tickets.value.length + 1,
      userId,
      title,
      description,
      status: 'open',
      createdAt: new Date(),
      responses: []
    }
    tickets.value.push(newTicket)
    return newTicket
  }

  function addResponse(ticketId: number, userId: string, message: string) {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (ticket) {
      const response: TicketResponse = {
        id: ticket.responses.length + 1,
        ticketId,
        userId,
        message,
        createdAt: new Date()
      }
      ticket.responses.push(response)
    }
  }

  function updateTicketStatus(ticketId: number, status: 'open' | 'in-progress' | 'resolved') {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (ticket) {
      ticket.status = status
    }
  }

  return {
    tickets,
    createTicket,
    addResponse,
    updateTicketStatus
  }
})