<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  items: Array,
  activeFilter: String
})

const emit = defineEmits(['filter'])

const getStatusColor = (status: string) => {
  const colors = {
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
  <div class="flex space-x-4">
    <button
      v-for="item in items"
      :key="item.status"
      @click="$emit('filter', item.status)"
      :class="[
        'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium',
        activeFilter === item.status ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'
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
  </div>
</template>

<style scoped>
/* Asegúrate de que los puntos tengan un tamaño visible */
.h-2 {
  height: 8px;
  width: 8px;
}
</style>