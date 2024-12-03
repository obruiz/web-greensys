<script setup lang="ts">
import { ref } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['created'])

const ticketStore = useTicketStore()
const authStore = useAuthStore()

const title = ref('')
const description = ref('')

const handleSubmit = () => {
  if (authStore.user) {
    ticketStore.createTicket(
      authStore.user.username,
      title.value,
      description.value
    )
    title.value = ''
    description.value = ''
    emit('created')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Título</label>
      <input v-model="title" type="text" class="input-field" required />
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
      <textarea 
        v-model="description" 
        rows="4" 
        class="input-field" 
        required
      ></textarea>
    </div>
    <button type="submit" class="btn-primary w-full">
      Crear Ticket
    </button>
  </form>
</template>