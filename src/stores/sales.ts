import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useCommissionStore } from './commissions'

interface Sale {
  id: number;
  userId: string;
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  metadata?: Record<string, any>;
  commission: {
    percentage: number;
    amount: number;
    total: number;
  };
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([])
  let nextId = 1

  // Etiquetas de estado en español
  const statusLabels = {
    pending: 'Pendiente de pago',
    paid: 'Pagada',
    failed: 'Fallida',
    refunded: 'Reembolsada',
    cancelled: 'Cancelada'
  }

  // Clases de estilo para cada estado
  const statusClasses = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-purple-50 text-purple-700',
    cancelled: 'bg-gray-50 text-gray-700'
  }

  const createSale = (saleData: Omit<Sale, 'id' | 'createdAt' | 'commission'>) => {
    const commissionStore = useCommissionStore()
    const rate = commissionStore.commissionRates.standard // Por defecto usamos la tarifa estándar

    const commission = commissionStore.calculateCommission(saleData.amount, rate)
    
    const sale: Sale = {
      id: nextId++,
      createdAt: new Date(),
      commission,
      ...saleData
    }
    sales.value.push(sale)
    return sale
  }

  const getSalesByUser = (userId: string) => {
    return sales.value.filter(sale => sale.userId === userId)
  }

  const updateSaleStatus = (saleId: number, newStatus: Sale['status']) => {
    const sale = sales.value.find(s => s.id === saleId)
    if (sale) {
      sale.status = newStatus
    }
  }

  // Para desarrollo, crear algunas ventas de ejemplo
  if (process.env.NODE_ENV === 'development') {
    createSale({
      userId: 'client',
      amount: 99.99,
      description: 'Plan Premium',
      reference: 'REF-001',
      status: 'paid',
      paymentMethod: 'card'
    })
    createSale({
      userId: 'client',
      amount: 49.99,
      description: 'Plan Básico',
      reference: 'REF-002',
      status: 'pending',
      paymentMethod: 'card'
    })
    createSale({
      userId: 'client',
      amount: 29.99,
      description: 'Servicio Adicional',
      reference: 'REF-003',
      status: 'failed',
      paymentMethod: 'card'
    })
  }

  return {
    sales,
    statusLabels,
    statusClasses,
    createSale,
    getSalesByUser,
    updateSaleStatus
  }
}) 