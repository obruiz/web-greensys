<script setup lang="ts">
import { defineProps, defineEmits, PropType } from 'vue'

const props = defineProps({
  items: {
    type: Array as PropType<Array<{ status: string; label: string; class: string }>>,
    required: true
  },
  activeFilter: String
})

const emit = defineEmits(['filter'])

const handleFilter = (status: string) => {
  if (props.activeFilter === status) {
    emit('filter', undefined)
  } else {
    emit('filter', status)
  }
}

type StatusColors = {
  'open': string;
  'in-progress': string;
  'resolved': string;
  'pending': string;
  'paid': string;
  'failed': string;
  'refunded': string;
  'cancelled': string;
  [key: string]: string;
}

const getStatusColor = (status: string): string => {
  const colors: StatusColors = {
    'open': '#3b82f6',        // blue-500
    'in-progress': '#eab308',  // yellow-500
    'resolved': '#10b981',    // emerald-500
    'pending': '#eab308',     // yellow-500
    'paid': '#10b981',        // emerald-500
    'failed': '#ef4444',      // red-500
    'refunded': '#8b5cf6',    // purple-500
    'cancelled': '#6b7280'    // gray-500
  }
  return colors[status] || '#6b7280'
}
</script>

<template>
  <div class="flex items-center space-x-4">
    <button
      v-for="item in items"
      :key="item.status"
      @click="handleFilter(item.status)"
      :class="[
        'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
        activeFilter === item.status ? item.class : 'bg-white hover:bg-gray-100'
      ]"
    >
      <div 
        class="w-3 h-3 rounded-full"
        :style="{
          backgroundColor: getStatusColor(item.status)
        }"
      ></div>
      <span>{{ item.label }}</span>
    </button>
    
    <button
      v-if="activeFilter"
      @click="$emit('filter', undefined)"
      class="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-gray-600 bg-white hover:bg-gray-100"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
      <span>Limpiar filtro</span>
    </button>
  </div>
</template>

<style scoped>
/* Asegúrate de que los puntos tengan un tamaño visible */
.h-2 {
  height: 8px;
  width: 8px;
}
</style>