<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <AlertCircle class="mx-auto h-24 w-24 text-emerald-500" />
      
      <div>
        <h2 class="text-4xl font-bold text-gray-900">404</h2>
        <p class="mt-2 text-lg text-gray-600">Página no encontrada</p>
        <p class="mt-1 text-gray-500">La página que buscas no existe o ha sido movida.</p>
      </div>

      <div>
        <button 
          @click="router.push('/')"
          class="btn-primary inline-flex items-center space-x-2"
        >
          <span>Volver al inicio</span>
        </button>
      </div>
    </div>
  </div>
</template> 