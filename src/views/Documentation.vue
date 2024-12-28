<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { BookOpen, Key, PlayCircle, Terminal, CheckCircle } from 'lucide-vue-next'

const authStore = useAuthStore()
const activeTab = ref('introduction')
const testApiKey = ref('')
const testResponse = ref('')
const isLoading = ref(false)
const payloadError = ref('')
const payloadText = ref(JSON.stringify({
  amount: 29.99,
  currency: "EUR",
  description: "Compra de prueba",
  reference: "ORDER-123",
  url_callback: "https://tienda.com/callback"
}, null, 2))

const validatePayload = () => {
  try {
    JSON.parse(payloadText.value)
    payloadError.value = ''
  } catch (e) {
    payloadError.value = 'JSON inválido'
  }
}

const runTest = async () => {
  console.log('Ejecutando prueba...')
  
  if (!testApiKey.value) {
    console.log('Error: No hay API key')
    testResponse.value = 'Error: Se requiere una API key para realizar la prueba'
    return
  }

  if (payloadError.value) {
    console.log('Error: JSON inválido')
    testResponse.value = 'Error: El payload no es un JSON válido'
    return
  }

  isLoading.value = true
  testResponse.value = ''
  console.log('Iniciando petición...')

  try {
    const payload = JSON.parse(payloadText.value)
    console.log('Payload parseado:', payload)
    
    const response = await fetch('https://sandbox.green-sys.es/sales', {
      method: 'POST',
      headers: {
        'x-api-key': `${testApiKey.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    testResponse.value = JSON.stringify(data, null, 2)
    console.log('Respuesta:', data)
  } catch (error: unknown) {
    console.error('Error en la petición:', error)
    testResponse.value = 'Error en la petición: ' + (error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    isLoading.value = false
    console.log('Petición finalizada')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="flex items-center space-x-3">
          <BookOpen class="h-8 w-8 text-emerald-500" />
          <h1 class="text-2xl font-bold text-gray-900">Documentación</h1>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="border-b border-gray-200 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <nav class="flex space-x-8">
          <button 
            v-for="tab in ['introduction', 'authentication', 'endpoint', 'cards', 'testing', 'faqs']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tab
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Introduction -->
      <div v-if="activeTab === 'introduction'" class="space-y-12">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Integra pagos seguros en minutos
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra API REST te permite procesar pagos de forma segura y eficiente
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card p-6 text-center">
            <Key class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-900">1. Crea tu API Key</h3>
            <p class="text-gray-600">Regístrate y genera tu API Key para comenzar.</p>
          </div>
          <div class="card p-6 text-center">
            <Terminal class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-900">2. Prueba en Sandbox</h3>
            <p class="text-gray-600">Desarrolla y prueba sin riesgo en nuestro entorno de pruebas.</p>
          </div>
          <div class="card p-6 text-center">
            <CheckCircle class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-900">3. Lanza en Producción</h3>
            <p class="text-gray-600">Cambia a producción cuando estés listo.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Sandbox</h3>
            <p class="text-gray-600 mb-4">
              Entorno de pruebas donde puedes realizar integraciones y pagos de prueba
              sin costo alguno.
            </p>
            <div class="bg-gray-100 p-4 rounded-lg">
              <code class="text-sm">https://sandbox.green-sys.es/sales</code>
            </div>
            <ul class="mt-4 space-y-2">
              <li class="flex items-center text-gray-600">
                <CheckCircle class="h-4 w-4 text-emerald-500 mr-2" />
                Tarjetas de prueba disponibles
              </li>
              <li class="flex items-center text-gray-600">
                <CheckCircle class="h-4 w-4 text-emerald-500 mr-2" />
                Sin límites de transacciones
              </li>
            </ul>
          </div>

          <div class="card p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Producción</h3>
            <p class="text-gray-600 mb-4">
              Entorno real para procesar pagos de tus clientes de forma segura.
              Certificación PCI DSS para máxima seguridad.
            </p>
            <div class="bg-gray-100 p-4 rounded-lg">
              <code class="text-sm">https://api.green-sys.es/sales</code>
            </div>
            <ul class="mt-4 space-y-2">
              <li class="flex items-center text-gray-600">
                <CheckCircle class="h-4 w-4 text-emerald-500 mr-2" />
                Procesamiento en tiempo real
              </li>
              <li class="flex items-center text-gray-600">
                <CheckCircle class="h-4 w-4 text-emerald-500 mr-2" />
                Certificado PCI DSS
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Authentication -->
      <div v-else-if="activeTab === 'authentication'" class="space-y-8">
        <div class="prose max-w-none">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Autenticación</h2>
          
          <div class="card p-6 mb-12">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Headers de Autenticación</h3>
            <p class="text-gray-600 mb-4">
              Todas las peticiones a la API deben incluir tu API key en el header <code>x-api-key</code>.
              Las API keys son únicas y no deben compartirse.
            </p>
            <div class="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-sm">
              x-api-key: tu_api_key
            </div>
          </div>

          <div class="card p-6">
            <div v-if="!authStore.isAuthenticated" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div class="flex items-center space-x-2">
                <Key class="h-5 w-5 text-yellow-500" />
                <span class="text-yellow-800 font-medium">
                  Inicia sesión para obtener tus API keys
                </span>
              </div>
              <div class="mt-4">
                <router-link to="/login" class="btn-primary">
                  Iniciar sesión
                </router-link>
              </div>
            </div>
            <div v-else class="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <div class="flex items-center space-x-2">
                <Key class="h-5 w-5 text-emerald-500" />
                <span class="text-emerald-800 font-medium">
                  Gestiona tus API keys en el panel de control
                </span>
              </div>
              <div class="mt-4">
                <router-link :to="authStore.isAdmin ? '/admin' : '/client'" class="btn-primary">
                  Ir al panel
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Endpoint -->
      <div v-else-if="activeTab === 'endpoint'" class="space-y-8">
        <div class="card">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                POST /sales
              </h3>
              <p class="mt-1 text-gray-600">Crea un nuevo pago y devuelve la URL del TPV</p>
            </div>
            <span class="px-2 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
              POST
            </span>
          </div>
          
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Ejemplo de petición:</h4>
            <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
{
  "amount": 29.99,
  "currency": "EUR",
  "description": "Compra de prueba",
  "reference": "ORDER-123",
  "url_callback": "https://tienda.com/callback"
}</pre>
          </div>

          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Respuesta exitosa:</h4>
            <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
{
  "id": "sale_123",
  "url": "https://tpv.green-sys.es/pay/sale_123",
  "amount": 29.99,
  "currency": "EUR",
  "status": "pending"
}</pre>
          </div>
        </div>
      </div>

      <!-- Cards -->
      <div v-else-if="activeTab === 'cards'" class="space-y-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Tarjetas de Prueba</h3>
          <p class="text-gray-600 mb-6">
            Usa estas tarjetas para probar diferentes escenarios en el entorno de sandbox.
          </p>

          <div class="space-y-6">
            <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 class="font-medium text-emerald-900 mb-2">Pago Exitoso</h4>
              <ul class="space-y-2 text-emerald-800">
                <li>Número: 4242 4242 4242 4242</li>
                <li>Fecha: Cualquier fecha futura</li>
                <li>CVV: Cualquier número de 3 dígitos</li>
              </ul>
            </div>

            <div class="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 class="font-medium text-red-900 mb-2">Pago Fallido</h4>
              <ul class="space-y-2 text-red-800">
                <li>Número: 4000 0000 0000 0002</li>
                <li>Fecha: Cualquier fecha futura</li>
                <li>CVV: Cualquier número de 3 dígitos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Testing -->
      <div v-else-if="activeTab === 'testing'" class="space-y-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Prueba la API</h3>
          <p class="text-gray-600 mb-6">
            Realiza una prueba rápida de la API usando tu API key de sandbox.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                v-model="testApiKey"
                type="text"
                class="input-field"
                placeholder="Ingresa tu API key de sandbox"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Payload
              </label>
              <textarea
                v-model="payloadText"
                @input="validatePayload"
                rows="8"
                class="input-field font-mono"
              ></textarea>
              <p v-if="payloadError" class="mt-1 text-sm text-red-600">
                {{ payloadError }}
              </p>
            </div>

            <div>
              <button
                @click="runTest"
                :disabled="isLoading || !!payloadError"
                class="btn-primary"
              >
                {{ isLoading ? 'Ejecutando...' : 'Probar API' }}
              </button>
            </div>

            <div v-if="testResponse" class="mt-4">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Respuesta:</h4>
              <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">{{ testResponse }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQs -->
      <div v-else-if="activeTab === 'faqs'" class="space-y-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Preguntas Frecuentes</h3>

          <div class="space-y-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                ¿Qué métodos de pago están disponibles?
              </h4>
              <p class="text-gray-600">
                Aceptamos todas las tarjetas principales (Visa, Mastercard, American Express)
                y transferencias bancarias SEPA.
              </p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                ¿Cuánto tiempo tarda en procesarse un pago?
              </h4>
              <p class="text-gray-600">
                Los pagos con tarjeta son instantáneos. Las transferencias SEPA pueden
                tardar hasta 24 horas hábiles.
              </p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                ¿Qué sucede si un pago falla?
              </h4>
              <p class="text-gray-600">
                Recibirás una notificación inmediata a través del webhook configurado
                con el motivo del fallo. El cliente puede reintentar el pago.
              </p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                ¿Cómo manejo los reembolsos?
              </h4>
              <p class="text-gray-600">
                Los reembolsos se pueden procesar a través de la API o desde el panel
                de control. El dinero se devuelve al método de pago original.
              </p>
            </div>

            <div>
              <h4 class="font-medium text-gray-900 mb-2">
                ¿Qué medidas de seguridad implementan?
              </h4>
              <p class="text-gray-600">
                Utilizamos certificación PCI DSS, cifrado de extremo a extremo,
                y autenticación 3D Secure 2.0 para garantizar la seguridad de las transacciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.btn-primary {
  @apply inline-flex justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-emerald-400 disabled:cursor-not-allowed;
}

.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500;
}
</style> 