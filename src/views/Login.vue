<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { BookOpen, CheckCircle, LogIn } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showRegisteredMessage = ref(false)

onMounted(() => {
  if (route.query.registered === 'true') {
    showRegisteredMessage.value = true
  }
})

const validateForm = () => {
  if (!username.value) {
    toastr.error('El nombre de usuario es requerido')
    return false
  }

  if (!password.value) {
    toastr.error('La contraseña es requerida')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm() || authStore.isLoading) return

  const result = await authStore.login(username.value, password.value)
  
  if (result === 'success') {
    toastr.success('Inicio de sesión exitoso')
    router.push(authStore.isAdmin ? '/admin' : '/client')
  } else if (authStore.lastError) {
    toastr.error(authStore.lastError.message)
  }
}
</script>

<template>
  <section class="h-[calc(100vh-4rem)] flex items-center">
    <div class="max-w-4xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <!-- Información de la plataforma -->
        <div class="space-y-6">
          <h2 class="text-3xl font-bold text-gray-900">
            Plataforma de Pago Segura para tu Negocio
          </h2>
          <div class="prose text-gray-600">
            <p>
              GreenSys ofrece una solución completa de TPV virtual para procesar pagos
              de forma segura y eficiente:
            </p>
            <ul class="space-y-2">
              <li class="flex items-center">
                <CheckCircle class="h-5 w-5 text-emerald-500 mr-2" />
                Integración sencilla mediante API REST
              </li>
              <li class="flex items-center">
                <CheckCircle class="h-5 w-5 text-emerald-500 mr-2" />
                Panel de control intuitivo
              </li>
              <li class="flex items-center">
                <CheckCircle class="h-5 w-5 text-emerald-500 mr-2" />
                Soporte 24/7
              </li>
              <li class="flex items-center">
                <CheckCircle class="h-5 w-5 text-emerald-500 mr-2" />
                Tasas competitivas
              </li>
            </ul>
          </div>
          <div class="flex items-center space-x-2">
            <BookOpen class="h-5 w-5 text-emerald-500" />
            <router-link to="/doc" class="text-emerald-600 hover:text-emerald-500">
              Consulta nuestra documentación
            </router-link>
          </div>
        </div>

        <!-- Formulario de login -->
        <div>
          <div class="text-center mb-8">
            <LogIn class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h1 class="text-3xl font-bold text-gray-900">Inicia Sesión</h1>
          </div>
          <div class="card shadow-lg p-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                <input 
                  v-model="username"
                  type="text" 
                  class="input-field" 
                  required
                  :disabled="authStore.isLoading"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  v-model="password"
                  type="password" 
                  class="input-field" 
                  required
                  :disabled="authStore.isLoading"
                />
              </div>
              <div v-if="authStore.lastError" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {{ authStore.lastError.message }}
              </div>
              <button 
                type="submit" 
                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="authStore.isLoading"
              >
                <span v-if="authStore.isLoading">Iniciando sesión...</span>
                <span v-else>Iniciar sesión</span>
              </button>
            </form>
            <div class="mt-4 text-center">
              <router-link to="/register" class="text-emerald-600 hover:text-emerald-500">
                ¿No tienes cuenta? Regístrate
              </router-link>
            </div>
          </div>
          <div v-if="showRegisteredMessage" class="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-lg">
            Tu registro se ha completado. Un administrador revisará tu cuenta pronto.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500;
}

.btn-primary {
  @apply bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2;
}

.card {
  @apply bg-white rounded-lg;
}
</style> 