<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { BookOpen } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  password: '',
  email: '',
  phone: '',
  businessName: '',
  legalName: '',
  businessType: '',
  website: '',
  country: '',
  taxId: '',
  bankName: '',
  iban: '',
  swift: ''
})

// Función para generar datos de prueba aleatorios
const generateTestData = () => {
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const randomNIF = Math.floor(Math.random() * 10000000).toString().padStart(8, '0')
  const randomIBAN = Math.floor(Math.random() * 10000000000).toString().padStart(22, '0')
  
  return {
    username: `test_user${randomNum}`,
    password: 'Test123!',
    email: `test${randomNum}@greensys.es`,
    phone: `+34666${randomNum}${randomNum}`, // Número español válido
    businessName: `Test Business ${randomNum} SL`,
    legalName: `Test Legal Name ${randomNum} Sociedad Limitada`,
    businessType: 'ecommerce',
    website: `https://test${randomNum}.greensys.es`,
    country: 'España',
    taxId: `B${randomNIF}`, // CIF válido formato español
    bankName: 'Banco Santander',
    iban: `ES${randomIBAN}`, // IBAN español válido
    swift: `BSCHESM${randomNum.substring(0, 3)}` // SWIFT válido del Santander
  }
}

// Solo en desarrollo, rellenar automáticamente los campos
onMounted(() => {
  if (process.env.NODE_ENV === 'development') {
    const testData = generateTestData()
    Object.keys(testData).forEach(key => {
      formData.value[key] = testData[key]
    })
  }
})

const validateForm = () => {
  const requiredFields = [
    'username', 'password', 'email', 'phone', 'businessName',
    'legalName', 'businessType', 'country', 'taxId', 'bankName',
    'iban', 'swift'
  ]

  for (const field of requiredFields) {
    if (!formData.value[field]) {
      toastr.error(`El campo ${field} es requerido`)
      return false
    }
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.value.email)) {
    toastr.error('El email no es válido')
    return false
  }

  // Validar teléfono (formato español)
  const phoneRegex = /^(\+34|0034|34)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$/
  if (!phoneRegex.test(formData.value.phone)) {
    toastr.error('El teléfono no es válido (debe ser un número español)')
    return false
  }

  // Validar CIF/NIF
  const taxIdRegex = /^[A-Z0-9]{9}$/
  if (!taxIdRegex.test(formData.value.taxId)) {
    toastr.error('El CIF/NIF no es válido (debe tener 9 caracteres)')
    return false
  }

  // Validar IBAN (formato español)
  const ibanRegex = /^ES\d{22}$/
  if (!ibanRegex.test(formData.value.iban)) {
    toastr.error('El IBAN no es válido (debe empezar por ES seguido de 22 números)')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm() || authStore.isLoading) return

  const success = await authStore.register(formData.value)
  
  if (success) {
    toastr.success('Registro exitoso. Un administrador revisará tu cuenta pronto.')
    router.push('/login?registered=true')
  } else if (authStore.lastError) {
    toastr.error(authStore.lastError.message)
  }
}
</script>

<template>
  <section class="py-12 bg-white">
    <div class="max-w-3xl mx-auto px-4">
      <div class="text-center mb-8">
        <BookOpen class="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h1 class="text-3xl font-bold text-gray-900">Crea tu Cuenta GreenSys</h1>
      </div>
      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Información de Usuario -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información de Usuario</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                <input 
                  v-model="formData.username" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  v-model="formData.password" 
                  type="password" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  v-model="formData.email" 
                  type="email" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input 
                  v-model="formData.phone" 
                  type="tel" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                  placeholder="+34 666777888"
                />
              </div>
            </div>
          </div>

          <!-- Información del Negocio -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información del Negocio</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <input 
                  v-model="formData.businessName" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Legal</label>
                <input 
                  v-model="formData.legalName" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Negocio</label>
                <select 
                  v-model="formData.businessType" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="ecommerce">Comercio Electrónico</option>
                  <option value="retail">Comercio Minorista</option>
                  <option value="services">Servicios</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <input 
                  v-model="formData.website" 
                  type="url" 
                  class="input-field" 
                  :disabled="authStore.isLoading"
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">País</label>
                <select 
                  v-model="formData.country" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                >
                  <option value="">Selecciona un país</option>
                  <option value="España">España</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID Fiscal (CIF/NIF)</label>
                <input 
                  v-model="formData.taxId" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                  placeholder="B12345678"
                />
              </div>
            </div>
          </div>

          <!-- Información Bancaria -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información Bancaria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Banco</label>
                <input 
                  v-model="formData.bankName" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input 
                  v-model="formData.iban" 
                  type="text" 
                  class="input-field" 
                  required 
                  :disabled="authStore.isLoading"
                  placeholder="ES1234567890123456789012"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código SWIFT</label>
              <input 
                v-model="formData.swift" 
                type="text" 
                class="input-field" 
                required 
                :disabled="authStore.isLoading"
                placeholder="ABCDES2AXXX"
              />
            </div>
          </div>

          <div v-if="authStore.lastError" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {{ authStore.lastError.message }}
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="authStore.isLoading"
          >
            <span v-if="authStore.isLoading">Creando cuenta...</span>
            <span v-else>Crear cuenta</span>
          </button>
          <div class="text-center">
            <router-link to="/login" class="text-emerald-600 hover:text-emerald-500">
              ¿Ya tienes cuenta? Inicia sesión
            </router-link>
          </div>
        </form>
      </div>
      <div class="text-center mt-4 text-sm text-gray-600">
        Al registrarte, un administrador deberá validar tu cuenta antes de que puedas iniciar sesión.
      </div>
    </div>
  </section>
</template>