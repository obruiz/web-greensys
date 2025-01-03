<script setup lang="ts">
interface LegendItem {
  status: string
  label: string
  class: string
}

defineProps<{
  items: LegendItem[]
  activeFilter?: string
}>()

const emit = defineEmits<{
  (e: 'filter', status: string | undefined): void
}>()

const handleClick = (status: string) => {
  if (status === props.activeFilter) {
    emit('filter', undefined)
  } else {
    emit('filter', status)
  }
}
</script>

<template>
  <div class="flex items-center space-x-4">
    <button
      v-for="item in items"
      :key="item.status"
      @click="handleClick(item.status)"
      :class="[
        'px-3 py-1 rounded-full text-sm font-medium',
        item.class,
        activeFilter === item.status ? 'ring-2 ring-offset-2 ring-emerald-500' : ''
      ]"
    >
      {{ item.label }}
    </button>
  </div>
</template> 