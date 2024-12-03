<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { BookOpen } from 'lucide-vue-next'
import toastr from '../toastrConfig'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  legalName: '',
  businessType: '',
  website: '',
  country: 'ES',
  taxId: ''
})

const validateForm = () => {
  if (!formData.value.username) {
    toastr.error('El nombre de usuario es requerido')
    return false
  }
  
  if (!formData.value.email) {
    toastr.error('El email es requerido')
    return false
  }

  if (!formData.value.email.includes('@')) {
    toastr.error('El email no es válido')
    return false
  }

  if (!formData.value.password) {
    toastr.error('La contraseña es requerida')
    return false
  }

  if (formData.value.password.length < 6) {
    toastr.error('La contraseña debe tener al menos 6 caracteres')
    return false
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    toastr.error('Las contraseñas no coinciden')
    return false
  }

  if (!formData.value.businessName) {
    toastr.error('El nombre del negocio es requerido')
    return false
  }

  if (!formData.value.legalName) {
    toastr.error('El nombre legal es requerido')
    return false
  }

  if (!formData.value.businessType) {
    toastr.error('El tipo de negocio es requerido')
    return false
  }

  if (!formData.value.taxId) {
    toastr.error('El ID fiscal es requerido')
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await authStore.register(formData.value)
    toastr.success('Registro exitoso')
    router.push('/login')
  } catch (error) {
    toastr.error('Error al registrar: ' + error.message)
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
                <input v-model="formData.username" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input v-model="formData.password" type="password" class="input-field" required />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="formData.email" type="email" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input v-model="formData.phone" type="tel" class="input-field" required />
              </div>
            </div>
          </div>

          <!-- Información del Negocio -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información del Negocio</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <input v-model="formData.businessName" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre Legal</label>
                <input v-model="formData.legalName" type="text" class="input-field" required />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Negocio</label>
                <input v-model="formData.businessType" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sitio Web (Opcional)</label>
                <input v-model="formData.website" type="url" class="input-field" />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">País</label>
                <select v-model="formData.country" class="input-field">
                  <option value="ES">España</option>
                  <option value="US">Estados Unidos</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID Fiscal (CIF/NIF)</label>
                <input v-model="formData.taxId" type="text" class="input-field" required />
              </div>
            </div>
          </div>

          <!-- Información Bancaria -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información Bancaria</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Banco</label>
                <input v-model="formData.bankName" type="text" class="input-field" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <input v-model="formData.iban" type="text" class="input-field" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Código SWIFT</label>
              <input v-model="formData.swift" type="text" class="input-field" required />
            </div>
          </div>

          <button type="submit" class="btn-primary w-full">
            Crear cuenta
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