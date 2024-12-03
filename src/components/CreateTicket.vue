<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/users'
import toastr from '../toastrConfig'

const emit = defineEmits(['created'])

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const title = ref('')
const description = ref('')
const selectedUser = ref('')

const isAdmin = computed(() => authStore.user?.role === 'admin')

const validateForm = () => {
  if (!title.value.trim()) {
    toastr.error('El título es requerido')
    return false
  }

  if (!description.value.trim()) {
    toastr.error('La descripción es requerida')
    return false
  }

  if (isAdmin.value && !selectedUser.value) {
    toastr.error('Debe seleccionar un cliente')
    return false
  }

  return true
}

const handleSubmit = () => {
  if (!validateForm()) return

  const userId = isAdmin.value ? selectedUser.value : authStore.user?.username

  if (userId) {
    try {
      ticketStore.createTicket(
        userId,
        title.value,
        description.value
      )
      toastr.success('Ticket creado exitosamente')
      title.value = ''
      description.value = ''
      selectedUser.value = ''
      emit('created')
    } catch (error) {
      toastr.error('Error al crear el ticket: ' + error.message)
    }
  }
}
</script>

<template>
  <div>
    <div v-if="isAdmin" class="mb-4">
      <label for="user" class="block text-sm font-medium text-gray-700">Seleccionar Cliente</label>
      <select v-model="selectedUser" id="user" class="input-field mt-1">
        <option value="" disabled>Seleccione un cliente</option>
        <option v-for="user in userStore.users" :key="user.username" :value="user.username">
          {{ user.username }}
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
      <input v-model="title" id="title" type="text" class="input-field mt-1" />
    </div>

    <div class="mb-4">
      <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
      <textarea v-model="description" id="description" rows="3" class="input-field mt-1"></textarea>
    </div>

    <button @click="handleSubmit" class="btn-primary">Crear Ticket</button>
  </div>
</template>