<script setup lang="ts">
import { ArrowRight, ShieldCheck, Zap, Clock, CreditCard } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    icon: ShieldCheck,
    title: 'Seguridad Garantizada',
    description: 'Protección de datos y transacciones con los más altos estándares de seguridad.'
  },
  {
    icon: Zap,
    title: 'Procesamiento Instantáneo',
    description: 'Pagos procesados en tiempo real para una experiencia fluida.'
  },
  {
    icon: Clock,
    title: 'Disponibilidad 24/7',
    description: 'Soporte técnico y monitoreo constante para tu tranquilidad.'
  },
  {
    icon: CreditCard,
    title: 'Múltiples Métodos de Pago',
    description: 'Acepta pagos con tarjetas, transferencias y más métodos populares.'
  }
]

const handleGetStarted = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
    <!-- Hero Section -->
    <div class="relative isolate px-6 pt-14 lg:px-8">
      <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Simplifica tus pagos con GreenSys
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            La plataforma de pagos más segura y eficiente para tu negocio. Procesa pagos en tiempo real, gestiona tus transacciones y accede a análisis detallados.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <button
              @click="handleGetStarted"
              class="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Empezar ahora
            </button>
            <button
              @click="handleLogin"
              class="text-sm font-semibold leading-6 text-gray-900 hover:text-emerald-600"
            >
              Iniciar sesión <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-emerald-600">Procesa pagos más rápido</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Todo lo que necesitas para gestionar tus pagos
          </p>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            Una solución completa que se adapta a las necesidades de tu negocio, con herramientas poderosas y una interfaz intuitiva.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            <div v-for="feature in features" :key="feature.title" class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <component :is="feature.icon" class="h-5 w-5 flex-none text-emerald-600" />
                {{ feature.title }}
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p class="flex-auto">{{ feature.description }}</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-white">
      <div class="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div class="relative isolate overflow-hidden bg-emerald-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 class="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Impulsa tu negocio con GreenSys
          </h2>
          <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Únete a miles de empresas que confían en nosotros para procesar sus pagos de forma segura y eficiente.
          </p>
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <button
              @click="handleGetStarted"
              class="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Crear cuenta gratis
            </button>
            <a href="#" class="text-sm font-semibold leading-6 text-white">
              Saber más <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gradient-text {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400;
}
</style> 