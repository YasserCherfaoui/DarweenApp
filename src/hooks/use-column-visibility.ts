import { useEffect, useState } from 'react'

const STORAGE_KEY = 'orders-table-column-visibility'

export type ColumnKey =
  | 'orderId'
  | 'customer'
  | 'source'
  | 'status'
  | 'total'
  | 'date'
  | 'externalOrderId'
  | 'customerPhone'
  | 'customerAddress'
  | 'customerState'
  | 'productTotal'
  | 'deliveryCost'
  | 'discount'
  | 'shippingProvider'
  | 'deliveryType'
  | 'customerComments'
  | 'orderItems'

export interface ColumnVisibility {
  [key: string]: boolean
}

const defaultVisibility: ColumnVisibility = {
  orderId: true,
  customer: true,
  source: true,
  status: true,
  total: true,
  date: true,
  externalOrderId: false,
  customerPhone: false,
  customerAddress: false,
  customerState: false,
  productTotal: false,
  deliveryCost: false,
  discount: false,
  shippingProvider: false,
  deliveryType: false,
  customerComments: false,
  orderItems: false,
}

export function useColumnVisibility() {
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(() => {
    if (typeof window === 'undefined') {
      return defaultVisibility
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new columns
        return { ...defaultVisibility, ...parsed }
      }
    } catch (error) {
      console.error('Error loading column visibility from localStorage:', error)
    }

    return defaultVisibility
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility))
    } catch (error) {
      console.error('Error saving column visibility to localStorage:', error)
    }
  }, [columnVisibility])

  const toggleColumn = (columnKey: ColumnKey) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

  const setColumnVisible = (columnKey: ColumnKey, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: visible,
    }))
  }

  const resetToDefaults = () => {
    setColumnVisibility(defaultVisibility)
  }

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisible,
    resetToDefaults,
  }
}

