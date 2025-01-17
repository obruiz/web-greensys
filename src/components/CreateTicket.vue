<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicketStore } from '../stores/tickets'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import toastr from '../toastrConfig'

const emit = defineEmits(['created'])

const ticketStore = useTicketStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

const title = ref('')
const description = ref('')
const selectedUser = ref('')

const isAdmin = computed(() => authStore.user?.role === 'admin')

// Obtener solo los clientes registrados
const availableClients = computed(() => 
  usersStore.users.filter(user => user.role === 'client')
)

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

const handleSubmit = async () => {
  if (!validateForm() || ticketStore.isLoading) return

  const success = await ticketStore.createTicket({
    title: title.value,
    description: description.value,
    ...(isAdmin.value && selectedUser.value && { userId: selectedUser.value })
  })

  if (success) {
    toastr.success('Ticket creado exitosamente')
    title.value = ''
    description.value = ''
    selectedUser.value = ''
    emit('created')
  } else if (ticketStore.lastError) {
    toastr.error(ticketStore.lastError.message)
  }
}

// Cargar la lista de usuarios si es admin
if (isAdmin.value) {
  usersStore.fetchUsers()
}
</script>

<template>
  <div>
    <div v-if="isAdmin" class="mb-4">
      <label for="user" class="block text-sm font-medium text-gray-700">Seleccionar Cliente</label>
      <select 
        v-model="selectedUser" 
        id="user" 
        class="input-field mt-1"
        :disabled="usersStore.isLoading"
      >
        <option value="" disabled>{{ usersStore.isLoading ? 'Cargando clientes...' : 'Seleccione un cliente' }}</option>
        <option v-for="user in availableClients" :key="user.username" :value="user.username">
          {{ user.businessName }} ({{ user.username }})
        </option>
      </select>
    </div>

    <div class="mb-4">
      <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
      <input 
        v-model="title" 
        id="title" 
        type="text" 
        class="input-field mt-1"
        :disabled="ticketStore.isLoading"
      />
    </div>

    <div class="mb-4">
      <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
      <textarea 
        v-model="description" 
        id="description" 
        rows="3" 
        class="input-field mt-1"
        :disabled="ticketStore.isLoading"
      ></textarea>
    </div>

    <button 
      @click="handleSubmit" 
      class="btn-primary"
      :disabled="ticketStore.isLoading"
    >
      <span v-if="ticketStore.isLoading">Creando ticket...</span>
      <span v-else>Crear Ticket</span>
    </button>
  </div>
</template>