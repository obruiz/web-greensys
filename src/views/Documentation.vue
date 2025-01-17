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
const selectedEnvironment = ref('sandbox')
const baseUrls = {
  sandbox: 'https://sandbox.green-sys.es/sales',
  production: 'https://api.green-sys.es/sales'
}
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
    
    const response = await fetch(baseUrls[selectedEnvironment.value], {
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
            v-for="tab in ['introduction', 'authentication', 'endpoint', 'cards', 'testing']"
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
          
          <!-- Explicación principal -->
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

          <!-- Gestión de API Keys -->
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

          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Respuestas:</h4>
            
            <div class="space-y-4">
              <!-- 201 -->
              <div class="border border-emerald-200 rounded-lg overflow-hidden">
                <div class="bg-emerald-50 px-4 py-2 border-b border-emerald-200">
                  <span class="text-sm font-medium text-emerald-800">201 - Venta creada exitosamente</span>
                </div>
                <div class="p-4">
                  <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
{
  "url": "https://green-sys.es/tpv/795d0a7f-2aca..."
}</pre>
                </div>
              </div>

              <!-- Nota de expiración -->
              <div class="border border-yellow-200 rounded-lg overflow-hidden">
                <div class="bg-yellow-50 px-4 py-2 border-b border-yellow-200">
                  <div class="flex items-center space-x-2">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-yellow-800">
                      Los enlaces de pago expiran después de 15 minutos y la venta pasará al estado "failure"
                    </span>
                  </div>
                </div>
              </div>

              <!-- 400 -->
              <div class="border border-red-200 rounded-lg overflow-hidden">
                <div class="bg-red-50 px-4 py-2 border-b border-red-200">
                  <span class="text-sm font-medium text-red-800">400 - Datos incompletos o referencia duplicada</span>
                </div>
              </div>

              <!-- 401 -->
              <div class="border border-red-200 rounded-lg overflow-hidden">
                <div class="bg-red-50 px-4 py-2 border-b border-red-200">
                  <span class="text-sm font-medium text-red-800">401 - Falta la API Key o la API Key es inválida</span>
                </div>
              </div>

              <!-- 500 -->
              <div class="border border-red-200 rounded-lg overflow-hidden">
                <div class="bg-red-50 px-4 py-2 border-b border-red-200">
                  <span class="text-sm font-medium text-red-800">500 - Error interno del servidor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cards -->
      <div v-else-if="activeTab === 'cards'" class="space-y-8">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Tarjetas de Prueba
          </h3>
          <p class="text-gray-600 mb-6">
            Utiliza estas tarjetas para realizar pruebas en el entorno sandbox. Cualquier otra tarjeta será rechazada.
          </p>
          
          <div class="space-y-6">
            <!-- Visa -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-medium text-gray-900">Visa</span>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Test Card</span>
              </div>
              <div class="space-y-2">
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <span class="text-sm text-gray-500">Número</span>
                    <div class="font-mono text-gray-900">4111 1111 1111 1111</div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">CVV</span>
                    <div class="font-mono text-gray-900">123</div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Expiración</span>
                    <div class="font-mono text-gray-900">12/25</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mastercard -->
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-lg font-medium text-gray-900">Mastercard</span>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">Test Card</span>
              </div>
              <div class="space-y-2">
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <span class="text-sm text-gray-500">Número</span>
                    <div class="font-mono text-gray-900">5500 0000 0000 0004</div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">CVV</span>
                    <div class="font-mono text-gray-900">456</div>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Expiración</span>
                    <div class="font-mono text-gray-900">11/26</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center space-x-2">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-yellow-800">
                  Cualquier otra tarjeta será rechazada.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Testing -->
      <div v-else-if="activeTab === 'testing'" class="space-y-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Prueba la API</h2>
        
        <!-- Probador interactivo -->
        <div class="card p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Entorno
            </label>
            <select 
              v-model="selectedEnvironment"
              class="input-field text-base"
            >
              <option value="sandbox">Sandbox (Pruebas)</option>
              <option value="production">Producción</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              URL ({{ selectedEnvironment === 'sandbox' ? 'Entorno de pruebas' : 'Entorno de producción' }})
            </label>
            <input 
              type="text"
              class="input-field bg-gray-100 cursor-not-allowed text-base"
              :value="baseUrls[selectedEnvironment]"
              disabled
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input 
              v-model="testApiKey"
              type="text"
              class="input-field text-base"
              placeholder="Introduce tu API key"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Payload
            </label>
            <textarea
              v-model="payloadText"
              @input="validatePayload"
              rows="6"
              class="w-full font-mono text-base bg-gray-800 text-gray-200 p-4 rounded-lg"
              style="height: 200px;"
              :class="{'border-2 border-red-500': payloadError}"
            ></textarea>
            <div v-if="payloadError" class="mt-1 text-sm text-red-500">
              {{ payloadError }}
            </div>
          </div>

          <button 
            @click.prevent="runTest()" 
            class="btn-primary flex items-center justify-center space-x-2 py-2 text-base"
            :disabled="isLoading || !!payloadError"
          >
            <PlayCircle v-if="!isLoading" class="h-5 w-5" />
            <Terminal v-else class="h-5 w-5 animate-spin" />
            <span>Ejecutar prueba</span>
          </button>

          <div v-if="testResponse" class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-1">Respuesta:</h4>
            <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto text-base">{{ testResponse }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante de contacto -->
    <a
      href="mailto:tmgm5@alu.ua.es"
      class="fixed bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg flex items-center space-x-2 transition-colors duration-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span>Contactar</span>
    </a>
  </div>
</template> 