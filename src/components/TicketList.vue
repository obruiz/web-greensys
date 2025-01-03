<script setup lang="ts">
interface Ticket {
  id: number
  userId: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
}

defineProps<{
  tickets: Ticket[]
  loading: boolean
}>()

const statusClasses = {
  'open': 'bg-blue-50 text-blue-700',
  'in-progress': 'bg-yellow-50 text-yellow-700',
  'resolved': 'bg-emerald-50 text-emerald-700'
}

const statusLabels = {
  'open': 'Abierto',
  'in-progress': 'En Proceso',
  'resolved': 'Resuelto'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
        </tr>
      </thead>
      <tbody v-if="!loading" class="bg-white divide-y divide-gray-200">
        <tr v-for="ticket in tickets" :key="ticket.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{{ ticket.id }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ ticket.userId }}</td>
          <td class="px-6 py-4 text-sm text-gray-900">{{ ticket.title }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusClasses[ticket.status]]">
              {{ statusLabels[ticket.status] }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ new Date(ticket.createdAt).toLocaleDateString() }}
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="i in 3" :key="i">
          <td v-for="j in 5" :key="j" class="px-6 py-4 whitespace-nowrap">
            <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template> 