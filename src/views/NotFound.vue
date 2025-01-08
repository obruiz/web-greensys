<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <h1 class="text-9xl font-bold text-emerald-600">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">Página no encontrada</h2>
      <p class="mt-4 text-lg text-gray-600">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
      <div class="mt-8 space-x-4">
        <button 
          @click="goBack"
          class="btn-secondary"
        >
          Volver atrás
        </button>
        <router-link 
          to="/" 
          class="btn-primary"
        >
          Ir al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2;
}
</style> 