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

export const useTicketStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as Ticket[]
  }),

  getters: {
    getTicketsByUser: (state) => (username: string) => {
      return state.tickets.filter(ticket => ticket.userId === username)
    }
  },

  actions: {
    createTicket(userId: string, title: string, description: string) {
      const newTicket: Ticket = {
        id: this.tickets.length + 1,
        userId,
        title,
        description,
        status: 'open',
        createdAt: new Date(),
        responses: []
      }
      this.tickets.push(newTicket)
      return newTicket
    },

    addResponse(ticketId: number, userId: string, message: string) {
      const ticket = this.tickets.find(t => t.id === ticketId)
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
    },

    updateTicketStatus(ticketId: number, status: 'open' | 'in-progress' | 'resolved') {
      const ticket = this.tickets.find(t => t.id === ticketId)
      if (ticket) {
        ticket.status = status
      }
    }
  }
})