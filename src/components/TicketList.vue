<script setup lang="ts">
import { useTicketStore } from '../stores/tickets'

const ticketStore = useTicketStore()

defineProps<{
  tickets: {
    id: number;
    title: string;
    description: string;
    status: 'open' | 'in-progress' | 'resolved';
    createdAt: Date;
  }[];
  loading: boolean;
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-if="loading">
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              Cargando tickets...
            </td>
          </tr>
        </template>
        <template v-else-if="tickets.length === 0">
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
              No hay tickets para mostrar
            </td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ ticket.id }}</td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="font-medium">{{ ticket.title }}</div>
              <div class="text-gray-500">{{ ticket.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', ticketStore.statusClasses[ticket.status]]">
                {{ ticketStore.statusLabels[ticket.status] }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(ticket.createdAt).toLocaleDateString() }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template> 