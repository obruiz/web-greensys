<script setup lang="ts">
import { Building2, ShieldCheck, CreditCard, Zap, Clock, BarChart3, CheckCircle } from 'lucide-vue-next'

const features = [
  {
    icon: ShieldCheck,
    title: 'Seguridad Avanzada',
    description: 'Certificación PCI DSS y cifrado de última generación'
  },
  {
    icon: Zap,
    title: 'Procesamiento Instantáneo',
    description: 'Confirmación inmediata de pagos'
  },
  {
    icon: BarChart3,
    title: 'Analytics en Tiempo Real',
    description: 'Seguimiento detallado de todas tus transacciones'
  }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Green System TPV
          </h1>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            La solución completa para procesar pagos de forma segura y eficiente
          </p>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="feature in features" :key="feature.title"
             class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <div class="flex items-center">
              <component :is="feature.icon" 
                        class="h-6 w-6 text-emerald-500" />
              <h3 class="ml-3 text-lg font-medium text-gray-900">
                {{ feature.title }}
              </h3>
            </div>
            <p class="mt-4 text-sm text-gray-500">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Section -->
    <div class="bg-white py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-4xl text-center">
          <h2 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Tarifas diseñadas para empresas de todos los tamaños
          </h2>
        </div>
        
        <div class="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          <!-- Plan Estándar -->
          <div class="bg-white p-8 ring-1 ring-gray-200 rounded-3xl">
            <h3 class="text-2xl font-bold text-gray-900">Estándar</h3>
            <p class="mt-4 text-base text-gray-600">
              Accede a una plataforma completa de pagos con unas tarifas muy sencillas en función del consumo. Sin comisiones mensuales, ocultas ni de configuración.
            </p>
            
            <div class="mt-8">
              <router-link to="/register" class="btn-primary">
                Empezar
              </router-link>
            </div>

            <div class="mt-8 space-y-6">
              <div class="bg-gray-50 p-6 rounded-2xl">
                <div class="text-2xl font-bold text-gray-900">1,5 % + 0,25 €</div>
                <div class="mt-2 text-sm text-gray-600">
                  para tarjetas estándar del Espacio Económico Europeo
                </div>
              </div>

              <div class="bg-gray-50 p-6 rounded-2xl">
                <div class="text-2xl font-bold text-gray-900">2,5 % + 0,25 €</div>
                <div class="mt-2 text-sm text-gray-600">
                  para tarjetas del Reino Unido
                </div>
              </div>

              <div class="bg-emerald-50 p-6 rounded-2xl">
                <div class="text-2xl font-bold text-emerald-900">1,2 % + 0,25 €</div>
                <div class="mt-2 text-sm text-emerald-600">
                  para todas las tarjetas europeas
                </div>
              </div>
            </div>
          </div>

          <!-- Plan Personalizado -->
          <div class="bg-gray-900 p-8 rounded-3xl">
            <h3 class="text-2xl font-bold text-white">Personalizado</h3>
            <p class="mt-4 text-base text-gray-300">
              Diseña un paquete personalizado; disponible para empresas con grandes volúmenes de pago o modelos de negocio únicos.
            </p>

            <div class="mt-8">
              <a href="mailto:sales@green-sys.es" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
                Contacta con ventas
              </a>
            </div>

            <div class="mt-8 space-y-4">
              <div class="flex items-center text-white">
                <CheckCircle class="h-5 w-5 text-emerald-400 mr-3" />
                <span>Tarifas de IC+</span>
              </div>
              <div class="flex items-center text-white">
                <CheckCircle class="h-5 w-5 text-emerald-400 mr-3" />
                <span>Descuentos por volumen</span>
              </div>
              <div class="flex items-center text-white">
                <CheckCircle class="h-5 w-5 text-emerald-400 mr-3" />
                <span>Descuentos por varios productos</span>
              </div>
              <div class="flex items-center text-white">
                <CheckCircle class="h-5 w-5 text-emerald-400 mr-3" />
                <span>Tarifas en función del país</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-emerald-500 mt-12">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span class="block">¿Listo para empezar?</span>
          <span class="block text-emerald-100">Únete hoy a Green System TPV</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <router-link to="/register"
                        class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50">
              Registrarse
            </router-link>
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <router-link to="/login"
                        class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              Iniciar sesión
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>