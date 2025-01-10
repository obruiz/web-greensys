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

interface Purchase {
  id: number;
  userId: string;
  name: string;
  date: string;
  amount: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const lastError = ref<AuthError | null>(null)
  const registeredUsers = ref<User[]>([])

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const isSandboxMode = computed(() => 
    window.location.hostname.startsWith('sandbox.')
  )

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

  async function register(userData: Omit<User, 'role' | 'status' | 'createdAt' | 'sandboxMode'> & { password: string }) {
    try {
      isLoading.value = true
      lastError.value = null

      const response = await fetch('https://api.green-sys.es/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        if (response.status === 400) {
          lastError.value = {
            code: 'VALIDATION_ERROR',
            message: 'Los datos proporcionados no son válidos. Por favor, revisa todos los campos.'
          }
        } else {
          lastError.value = {
            code: 'SERVER_ERROR',
            message: 'Error en el servidor. Por favor, inténtalo más tarde.'
          }
        }
        return false
      }

      return true
    } catch (error) {
      lastError.value = {
        code: 'NETWORK_ERROR',
        message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

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
          sandboxMode: window.location.hostname.startsWith('sandbox.'),
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
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = {
            code: 'INVALID_CREDENTIALS',
            message: 'Sesión expirada. Por favor, inicie sesión de nuevo.'
          }
          logout()
        } else {
          lastError.value = {
            code: 'SERVER_ERROR',
            message: error.response?.data?.message || 'Error al cargar el perfil.'
          }
        }
      } else {
        lastError.value = {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        }
      }
      return false
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      if (!token.value) {
        lastError.value = {
          code: 'INVALID_CREDENTIALS',
          message: 'No hay sesión activa. Por favor, inicie sesión.'
        }
        return false
      }

      lastError.value = null // Limpiar errores anteriores
      isLoading.value = true

      const response = await axios.put('https://api.green-sys.es/profile', 
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && user.value) {
        // Actualizar solo los campos que se han modificado
        Object.assign(user.value, response.data.profile || response.data)
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          lastError.value = {
            code: 'INVALID_CREDENTIALS',
            message: 'Sesión expirada. Por favor, inicie sesión nuevamente.'
          }
          logout()
        } else {
          lastError.value = {
            code: 'SERVER_ERROR',
            message: error.response?.data?.message || 'Error al actualizar el perfil. Por favor, inténtelo de nuevo.'
          }
        }
      } else {
        lastError.value = {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        }
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUsers() {
    try {
      if (!token.value || !isAdmin.value) return false

      const response = await axios.get('https://api.green-sys.es/users', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      registeredUsers.value = response.data
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout()
        }
        lastError.value = {
          code: 'SERVER_ERROR',
          message: error.response?.data?.message || 'Error al obtener los usuarios.'
        }
      } else {
        lastError.value = {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        }
      }
      return false
    }
  }

  async function updateUserStatus(username: string, status: 'pending' | 'active' | 'inactive') {
    try {
      if (!token.value || !isAdmin.value) return false

      await axios.put(`https://api.green-sys.es/users/${username}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        }
      )

      // Actualizar el estado del usuario en la lista local
      const userIndex = registeredUsers.value.findIndex(u => u.username === username)
      if (userIndex !== -1) {
        registeredUsers.value[userIndex].status = status
      }

      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout()
        }
        lastError.value = {
          code: 'SERVER_ERROR',
          message: error.response?.data?.message || 'Error al actualizar el estado del usuario.'
        }
      } else {
        lastError.value = {
          code: 'NETWORK_ERROR',
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.'
        }
      }
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
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    fetchUsers,
    updateUserStatus
  }
})