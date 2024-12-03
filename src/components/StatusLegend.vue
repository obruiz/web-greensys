<script setup lang="ts">
const props = defineProps<{
  items: {
    status: string;
    label: string;
    class: string;
  }[];
  activeFilter?: string | null;
}>()

const emit = defineEmits<{
  (e: 'filter', status: string | null): void;
}>()

const handleClick = (status: string) => {
  if (status === props.activeFilter) {
    emit('filter', null) // Desactivar filtro si ya está activo
  } else {
    emit('filter', status) // Activar nuevo filtro
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-3 text-sm">
    <div v-for="item in items" :key="item.status" 
         @click="handleClick(item.status)"
         :class="[
           'flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer transition-colors',
           activeFilter === item.status ? item.class : 'hover:bg-gray-100'
         ]">
      <span :class="['w-2 h-2 rounded-full', item.class.replace('text-', 'bg-').replace('-50', '-400')]"></span>
      <span :class="[
        'text-gray-600',
        activeFilter === item.status ? 'font-medium' : ''
      ]">{{ item.label }}</span>
    </div>
  </div>
</template> 