import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  website?: string;
  country: string;
  taxId: string;
  bankName: string;
  iban: string;
  swift: string;
  createdAt: Date;
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
  const registeredUsers = ref([
    { 
      username: 'admin', 
      password: 'admin', 
      role: 'admin', 
      status: 'active',
      // ... otros campos requeridos con valores por defecto
    },
    { 
      username: 'client', 
      password: 'client', 
      role: 'client', 
      status: 'active',
      email: 'cliente@ejemplo.com',
      phone: '+34 666777888',
      businessName: 'Empresa Ejemplo SL',
      legalName: 'Empresa Ejemplo Sociedad Limitada',
      businessType: 'Comercio Electrónico',
      website: 'www.ejemplo.com',
      country: 'España',
      taxId: 'B12345678',
      bankName: 'Banco Ejemplo',
      iban: 'ES1234567890123456789012',
      swift: 'EXPLES21XXX',
      createdAt: new Date()
    }
  ])

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const isSandboxMode = computed(() => 
    window.location.hostname.startsWith('sandbox.')
  )

  function register(userData: Omit<User, 'role' | 'status'> & { password: string }) {
    const newUser = {
      ...userData,
      role: 'client' as const,
      status: 'pending' as const
    }
    registeredUsers.value.push(newUser)
    return true
  }

  function login(username: string, password: string) {
    const foundUser = registeredUsers.value.find(
      u => u.username === username && 
      u.password === password
    )
    
    if (foundUser) {
      if (foundUser.status === 'pending') {
        return 'pending'
      } else if (foundUser.status === 'inactive') {
        return 'inactive'
      }
      
      user.value = {
        ...foundUser,
        sandboxMode: window.location.hostname.startsWith('sandbox.')
      }
      return 'success'
    }
    return 'error'
  }

  function logout() {
    user.value = null
  }

  function toggleUserStatus(username: string) {
    const userToUpdate = registeredUsers.value.find(u => u.username === username)
    if (userToUpdate) {
      // Si está activo, lo desactivamos
      if (userToUpdate.status === 'active') {
        userToUpdate.status = 'inactive'
      }
      // Si está inactivo o pendiente, lo activamos
      else {
        userToUpdate.status = 'active'
      }
      
      // Si el usuario que se está modificando es el usuario actual, actualizamos su estado
      if (user.value && user.value.username === username) {
        user.value.status = userToUpdate.status
      }
    }
  }

  const purchases = ref<Purchase[]>([])

  const userPurchases = computed(() => 
    purchases.value.filter(p => p.userId === user.value?.username)
  )

  function updateUserProfile(userData: Partial<User>) {
    if (!user.value) return false

    const userToUpdate = registeredUsers.value.find(
      u => u.username === user.value?.username
    )
    
    if (userToUpdate) {
      // Actualizar solo los campos permitidos
      const allowedFields = [
        'email', 'phone', 'businessName', 'legalName',
        'businessType', 'website', 'country', 'taxId',
        'bankName', 'iban', 'swift'
      ]
      
      allowedFields.forEach(field => {
        if (field in userData) {
          userToUpdate[field] = userData[field]
          user.value[field] = userData[field]
        }
      })
      
      return true
    }
    return false
  }

  return {
    user,
    registeredUsers,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    toggleUserStatus,
    userPurchases,
    isSandboxMode,
    updateUserProfile
  }
})