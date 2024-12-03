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
  amount: 1000,
  currency: "EUR",
  description: "Compra de prueba",
  reference: "ORDER-123"
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
    
    // Simulamos una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    testResponse.value = JSON.stringify({
      success: true,
      data: {
        paymentUrl: `https://sandbox.green-sys.es/tpv/payment_${Date.now()}`,
        amount: payload.amount,
        currency: payload.currency,
        reference: payload.reference
      }
    }, null, 2)
    console.log('Respuesta generada:', testResponse.value)
  } catch (error) {
    console.error('Error en la petición:', error)
    testResponse.value = 'Error en la petición: ' + error.message
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
            v-for="tab in ['introduction', 'authentication', 'endpoints', 'testing']"
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
              <code class="text-sm">https://sandbox.green-sys.es</code>
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
            </p>
            <div class="bg-gray-100 p-4 rounded-lg">
              <code class="text-sm">https://back.green-sys.es</code>
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
              Todas las peticiones a la API deben incluir tu API key en el header <code>Authorization</code>.
              Las API keys son únicas y no deben compartirse.
            </p>
            <div class="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-sm">
              Authorization: Bearer tu_api_key
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

      <!-- Endpoints -->
      <div v-else-if="activeTab === 'endpoints'" class="space-y-8">
        <div class="card">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">
                POST https://sandbox.green-sys.es/api/v1/payment
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
  "amount": 1000,
  "currency": "EUR",
  "description": "Compra de prueba",
  "reference": "ORDER-123"
}</pre>
          </div>

          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Respuesta:</h4>
            <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
{
  "success": true,
  "data": {
    "paymentUrl": "https://sandbox.green-sys.es/tpv/abc123..."
  }
}</pre>
          </div>
        </div>
      </div>

      <!-- Testing -->
      <div v-else-if="activeTab === 'testing'" class="space-y-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Prueba la API</h2>
        
        <!-- Probador interactivo -->
        <div class="card space-y-4 mb-8">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input 
              v-model="testApiKey"
              type="text"
              class="input-field"
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
              class="w-full font-mono text-sm bg-gray-800 text-gray-200 p-4 rounded-lg"
              :class="{'border-2 border-red-500': payloadError}"
            ></textarea>
            <div v-if="payloadError" class="mt-1 text-sm text-red-500">
              {{ payloadError }}
            </div>
          </div>

          <button 
            @click.prevent="runTest()" 
            class="btn-primary flex items-center justify-center space-x-2"
            :disabled="isLoading || payloadError"
          >
            <PlayCircle v-if="!isLoading" class="h-5 w-5" />
            <Terminal v-else class="h-5 w-5 animate-spin" />
            <span>Ejecutar prueba</span>
          </button>

          <div v-if="testResponse" class="mt-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Respuesta:</h4>
            <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">{{ testResponse }}</pre>
          </div>
        </div>
        
        <!-- Ejemplo en Python -->
        <div class="card p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Ejemplo en Python</h3>
          <pre class="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
import requests

url = "https://sandbox.green-sys.es/api/v1/payment"
headers = {
    "Authorization": "Bearer tu_api_key",
    "Content-Type": "application/json"
}
data = {
    "amount": 1000,
    "currency": "EUR",
    "description": "Compra de prueba",
    "reference": "ORDER-123"
}

response = requests.post(url, headers=headers, json=data)

if response.ok:
    print("Pago creado:", response.json())
else:
    print("Error:", response.status_code, response.text)</pre>
        </div>
      </div>
    </div>
  </div>
</template> 