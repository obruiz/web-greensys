import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Commission {
  percentage: number;
  fixed: number;
}

export const useCommissionStore = defineStore('commissions', () => {
  const commission = ref<Commission>({
    percentage: 1.4, // 1.4%
    fixed: 0.25 // 0.25€
  })

  const calculateCommission = (amount: number) => {
    const total = (amount * (commission.value.percentage / 100)) + commission.value.fixed
    return {
      percentage: commission.value.percentage,
      fixed: commission.value.fixed,
      total
    }
  }

  return {
    commission,
    calculateCommission
  }
}) 