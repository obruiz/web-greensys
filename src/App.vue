<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Building2, BookOpen } from 'lucide-vue-next'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import toastr from './toastrConfig'

const route = useRoute()
const authStore = useAuthStore()
const router = useRouter()

const showNavbar = computed(() => !route.path.startsWith('/tpv/'))

const handleLogout = () => {
  authStore.logout()
  router.push('/')
  toastr.success('Has cerrado sesión exitosamente')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav v-if="showNavbar" class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <Building2 class="h-8 w-8 text-emerald-500" />
            <router-link to="/" class="ml-2 text-xl font-bold text-gray-900">GreenSys</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/doc" class="p-2 text-gray-600 hover:text-emerald-500">
              <BookOpen class="h-6 w-6" />
            </router-link>
            <template v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="btn-secondary">Iniciar Sesión</router-link>
              <router-link to="/register" class="btn-primary">Comenzar</router-link>
            </template>
            <template v-else>
              <router-link 
                :to="authStore.isAdmin ? '/admin' : '/client'" 
                class="btn-secondary"
              >
                Panel
              </router-link>
              <router-link 
                to="/profile" 
                class="btn-secondary"
              >
                Mi Perfil
              </router-link>
              <button @click="handleLogout" class="btn-primary">
                Cerrar Sesión
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>