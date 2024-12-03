import { defineStore } from 'pinia'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [
      { username: 'cliente1', name: 'Cliente Uno' },
      { username: 'cliente2', name: 'Cliente Dos' },
      // Agrega más usuarios según sea necesario
    ]
  }),

  getters: {
    getUsernames: (state) => state.users.map(user => user.username)
  }
}) 