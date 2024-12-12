import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

interface User {
  username: string;
  role: 'admin' | 'client';
  status: 'pending' | 'active' | 'inactive';
  sandboxMode?: boolean;
  email: string;
  phone: string;
  businessName: string;
  legalName: string;
  businessType: string;
  website: string;
  country: string;
  taxId: string;
  bankName: string;
  iban: string;
  swift: string;
  createdAt: Date;
}

interface JWTPayload {
  sub: string;
  role: 'admin' | 'client';
  exp: number;
}

interface AuthError {
  code: 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_CREDENTIALS' | 'ACCOUNT_INACTIVE' | 'VALIDATION_ERROR';
  message: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const lastError = ref<AuthError | null>(null)
  const registeredUsers = ref<User[]>([])

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const isSandboxMode = computed(() => {
    const hostname = window.location.hostname
    return typeof hostname === 'string' && hostname.indexOf('sandbox.') === 0
  })

  // Inicializar el store con los datos del localStorage
  const initializeStore = async () => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken)
        // Verificar si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          logout()
          return
        }
        
        // Inicializar el usuario con los datos básicos del token
        user.value = {
          username: decoded.sub,
          role: decoded.role,
          status: 'active',
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
          swift: '',
          createdAt: new Date()
        }

        // Cargar el resto de datos del perfil
        await getProfile()
      } catch (error) {
        logout()
      }
    }
  }

  // Llamar a initializeStore cuando se crea el store
  initializeStore()

  async function login(username: string, password: string) {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await fetch('https://api.green-sys.es/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        if (response.status === 403) {
          lastError.value = {
            code: 'ACCOUNT_INACTIVE',
            message: 'Tu cuenta está inactiva o pendiente de aprobación.'
          }
          return 'inactive'
        }
        if (response.status === 404 || response.status === 401) {
          lastError.value = {
            code: 'INVALID_CREDENTIALS',
            message: 'Usuario o contraseña incorrectos.'
          }
          return 'error'
        }
        
        lastError.value = {
          code: 'SERVER_ERROR',
          message: 'Error en el servidor. Por favor, inténtalo más tarde.'
        }
        return 'error'
      }

      const data = await response.json()
      
      if (!data.token) {
        lastError.value = {
          code: 'SERVER_ERROR',
          message: 'Error en la respuesta del servidor. Token no encontrado.'
        }
        return 'error'
      }

      token.value = data.token
      localStorage.setItem('auth_token', data.token)

      try {
        const decoded = jwtDecode<JWTPayload>(data.token)
        
        user.value = {
          username: decoded.sub,
          role: decoded.role,
          status: 'active' as const,
          sandboxMode: window.location.hostname.indexOf('sandbox.') === 0,
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
          swift: '',
          createdAt: new Date()
        }

        // Cargar los datos completos del perfil después del login
        await getProfile()

        return 'success'
      } catch (error) {
        lastError.value = {
          code: 'SERVER_ERROR',
          message: 'Error al procesar la respuesta del servidor.'
        }
        return 'error'
      }
    } catch (error) {
      lastError.value = {
        code: 'NETWORK_ERROR',
        message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
      }
      return 'error'
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  async function getProfile() {
    try {
      if (!token.value) return false

      const response = await axios.get('https://api.green-sys.es/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.data.profile && user.value) {
        Object.assign(user.value, response.data.profile)
        return true
      }

      return false
    } catch (error) {
      console.error('Error al obtener el perfil:', error)
      return false
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      if (!token.value) return false

      const response = await axios.put('https://api.green-sys.es/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.data.success && user.value) {
        Object.assign(user.value, profileData)
        return true
      }

      return false
    } catch (error) {
      console.error('Error al actualizar el perfil:', error)
      return false
    }
  }

  return {
    user,
    token,
    isLoading,
    lastError,
    registeredUsers,
    isAuthenticated,
    isAdmin,
    isSandboxMode,
    login,
    logout,
    getProfile,
    updateProfile
  }
}) 