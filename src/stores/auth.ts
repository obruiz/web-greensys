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
      // ... otros campos requeridos con valores por defecto
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

  const purchases = ref<Purchase[]>([
    { 
      id: 1,
      userId: 'client',
      name: 'Plan Premium', 
      date: '14 Mar, 2024', 
      amount: '$99.00' 
    },
    { 
      id: 2,
      userId: 'client',
      name: 'Servicio Adicional', 
      date: '10 Mar, 2024', 
      amount: '$29.00' 
    }
  ])

  const userPurchases = computed(() => 
    purchases.value.filter(p => p.userId === user.value?.username)
  )

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
    isSandboxMode
  }
})