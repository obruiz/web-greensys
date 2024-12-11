import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCommissionStore = defineStore('commissions', () => {
  const commissionRates = ref({
    standard: 2.9,    // 2.9%
    premium: 1.9,     // 1.9%
    enterprise: 0.9   // 0.9%
  })

  const calculateCommission = (amount: number, rate: number) => {
    const commissionAmount = (amount * rate) / 100
    return {
      percentage: rate,
      amount: commissionAmount,
      total: amount - commissionAmount
    }
  }

  return {
    commissionRates,
    calculateCommission
  }
}) 