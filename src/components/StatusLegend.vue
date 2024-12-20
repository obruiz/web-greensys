<script setup lang="ts">
defineProps<{
  items: {
    status: string;
    label: string;
    class: string;
  }[];
  activeFilter?: string;
}>()

defineEmits<{
  (e: 'filter', status: string | undefined): void;
}>()
</script>

<template>
  <div class="flex items-center space-x-4">
    <button 
      @click="$emit('filter', undefined)"
      :class="[
        'px-2 py-1 text-xs font-medium rounded-full',
        !activeFilter ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      ]"
    >
      Todos
    </button>
    <button 
      v-for="item in items" 
      :key="item.status"
      @click="$emit('filter', item.status)"
      :class="[
        'px-2 py-1 text-xs font-medium rounded-full',
        activeFilter === item.status ? item.class : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      ]"
    >
      {{ item.label }}
    </button>
  </div>
</template> 