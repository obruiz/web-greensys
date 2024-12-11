<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import toastr from '../toastrConfig'

const authStore = useAuthStore()
const formData = ref({
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

onMounted(() => {
  if (authStore.user) {
    Object.keys(formData.value).forEach(key => {
      formData.value[key] = authStore.user[key]
    })
  }
})

const handleSubmit = async () => {
  try {
    const success = await authStore.updateUserProfile(formData.value)
    if (success) {
      toastr.success('Perfil actualizado exitosamente')
    } else {
      toastr.error('Error al actualizar el perfil')
    }
  } catch (error) {
    toastr.error('Error: ' + error.message)
  }
}
</script>

<template>
  <section class="py-12">
    <div class="max-w-3xl mx-auto px-4">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        <p class="mt-2 text-gray-600">Actualiza tu información personal y datos de negocio</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Información de Contacto -->
          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">Información de Contacto</h2>
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
                <select v-model="formData.country" class="input-field" required>
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
            Actualizar Perfil
          </button>
        </form>
      </div>
    </div>
  </section>
</template> 