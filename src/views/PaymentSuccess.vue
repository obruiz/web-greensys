<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const reference = route.query.reference
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-center">
      <CheckCircle class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pago Completado!</h1>
      <p class="text-gray-600 mb-4">
        Tu pago se ha procesado correctamente.
        <br>
        Referencia: {{ reference }}
      </p>
      <button @click="router.push('/')" class="btn-primary">
        Volver al inicio
      </button>
    </div>
  </div>
</template> 