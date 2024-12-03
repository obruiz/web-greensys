import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SaleStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'

interface Sale {
  id: string;
  userId: string;
  amount: number;
  description: string;
  reference: string;
  status: SaleStatus;
  createdAt: Date;
  updatedAt: Date;
  paymentMethod?: string;
  metadata?: {
    customerEmail?: string;
    customerName?: string;
    [key: string]: any;
  };
}

export const useSalesStore = defineStore('sales', () => {
  const sales = ref<Sale[]>([
    {
      id: '1',
      userId: 'client',
      amount: 99.99,
      description: 'Plan Premium',
      reference: 'SALE-001',
      status: 'paid',
      createdAt: new Date('2024-03-14'),
      updatedAt: new Date('2024-03-14'),
      paymentMethod: 'card',
      metadata: {
        customerEmail: 'cliente@ejemplo.com',
        customerName: 'Cliente Ejemplo'
      }
    }
  ])

  const statusLabels: Record<SaleStatus, string> = {
    pending: 'Pendiente de pago',
    paid: 'Pagada',
    failed: 'Fallida',
    refunded: 'Reembolsada',
    cancelled: 'Cancelada'
  }

  const statusClasses: Record<SaleStatus, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    paid: 'bg-emerald-50 text-emerald-700',
    failed: 'bg-red-50 text-red-700',
    refunded: 'bg-purple-50 text-purple-700',
    cancelled: 'bg-gray-50 text-gray-700'
  }

  function createSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) {
    const newSale: Sale = {
      id: `SALE-${sales.value.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...saleData
    }
    sales.value.push(newSale)
    return newSale
  }

  function updateSaleStatus(saleId: string, status: SaleStatus) {
    const sale = sales.value.find(s => s.id === saleId)
    if (sale) {
      sale.status = status
      sale.updatedAt = new Date()
    }
  }

  function getSalesByUser(userId: string) {
    return sales.value.filter(sale => sale.userId === userId)
  }

  function getSaleByReference(reference: string) {
    return sales.value.find(sale => sale.reference === reference)
  }

  // Función para comprobar si una venta puede ser cancelada
  function canCancelSale(sale: Sale) {
    return sale.status === 'pending'
  }

  // Función para comprobar si una venta puede ser reembolsada
  function canRefundSale(sale: Sale) {
    return sale.status === 'paid'
  }

  // Función para cancelar una venta
  function cancelSale(saleId: string) {
    const sale = sales.value.find(s => s.id === saleId)
    if (sale && canCancelSale(sale)) {
      sale.status = 'cancelled'
      sale.updatedAt = new Date()
    }
  }

  // Función para reembolsar una venta
  function refundSale(saleId: string) {
    const sale = sales.value.find(s => s.id === saleId)
    if (sale && canRefundSale(sale)) {
      sale.status = 'refunded'
      sale.updatedAt = new Date()
    }
  }

  return {
    sales,
    statusLabels,
    statusClasses,
    createSale,
    updateSaleStatus,
    getSalesByUser,
    getSaleByReference,
    canCancelSale,
    canRefundSale,
    cancelSale,
    refundSale
  }
}) 