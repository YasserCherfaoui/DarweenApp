import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  Sale,
  CreateSaleRequest,
  AddPaymentRequest,
  ProcessRefundRequest,
  CashDrawer,
  OpenCashDrawerRequest,
  CloseCashDrawerRequest,
  SalesReportRequest,
  PaginationParams,
  ProductVariantSearchResponse,
} from '@/types/api'

// Product search queries for POS sales
export const useSearchProductsForSale = (
  companyId: number,
  franchiseId: number | null,
  query: string,
  debounceMs: number = 300
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  return useQuery({
    queryKey: ['pos', 'products', 'search', companyId, franchiseId, debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return { data: [] }
      }
      const response = await apiClient.pos.products.search(
        companyId,
        debouncedQuery,
        franchiseId || undefined
      )
      return response
    },
    enabled: !!companyId && debouncedQuery.trim().length > 0,
  })
}

// Customer queries
export const useCustomers = (companyId: number, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['pos', 'customers', companyId, params],
    queryFn: async () => {
      const response = await apiClient.pos.customers.list(companyId, params)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useCustomer = (companyId: number, customerId: number) => {
  return useQuery({
    queryKey: ['pos', 'customers', companyId, customerId],
    queryFn: async () => {
      const response = await apiClient.pos.customers.get(companyId, customerId)
      return response.data
    },
    enabled: !!companyId && !!customerId,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number
      data: CreateCustomerRequest
    }) => {
      const response = await apiClient.pos.customers.create(companyId, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'customers', variables.companyId],
      })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      customerId,
      data,
    }: {
      companyId: number
      customerId: number
      data: UpdateCustomerRequest
    }) => {
      const response = await apiClient.pos.customers.update(
        companyId,
        customerId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'customers', variables.companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pos', 'customers', variables.companyId, variables.customerId],
      })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      customerId,
    }: {
      companyId: number
      customerId: number
    }) => {
      await apiClient.pos.customers.delete(companyId, customerId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'customers', variables.companyId],
      })
    },
  })
}

// Sale queries
export const useSales = (
  companyId: number,
  params?: PaginationParams & { franchise_id?: number }
) => {
  return useQuery({
    queryKey: ['pos', 'sales', companyId, params],
    queryFn: async () => {
      const response = await apiClient.pos.sales.list(companyId, params)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useSale = (companyId: number, saleId: number) => {
  return useQuery({
    queryKey: ['pos', 'sales', companyId, saleId],
    queryFn: async () => {
      const response = await apiClient.pos.sales.get(companyId, saleId)
      return response.data
    },
    enabled: !!companyId && !!saleId,
  })
}

export const useFranchiseSales = (
  franchiseId: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['pos', 'sales', 'franchise', franchiseId, params],
    queryFn: async () => {
      const response = await apiClient.pos.sales.listByFranchise(
        franchiseId,
        params
      )
      return response.data
    },
    enabled: !!franchiseId,
  })
}

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number
      data: CreateSaleRequest
    }) => {
      const response = await apiClient.pos.sales.create(companyId, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'sales', variables.companyId],
      })
      // Invalidate inventory queries as stock has changed
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      // Invalidate cash drawer if applicable
      queryClient.invalidateQueries({ queryKey: ['pos', 'cash-drawer'] })
    },
  })
}

export const useAddPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      saleId,
      data,
    }: {
      companyId: number
      saleId: number
      data: AddPaymentRequest
    }) => {
      const response = await apiClient.pos.sales.addPayment(
        companyId,
        saleId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'sales', variables.companyId, variables.saleId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pos', 'sales', variables.companyId],
      })
      queryClient.invalidateQueries({ queryKey: ['pos', 'cash-drawer'] })
    },
  })
}

export const useProcessRefund = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      saleId,
      data,
    }: {
      companyId: number
      saleId: number
      data: ProcessRefundRequest
    }) => {
      const response = await apiClient.pos.sales.processRefund(
        companyId,
        saleId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'sales', variables.companyId, variables.saleId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pos', 'sales', variables.companyId],
      })
      queryClient.invalidateQueries({ queryKey: ['pos', 'refunds'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['pos', 'cash-drawer'] })
    },
  })
}

// Refund queries
export const useRefunds = (
  companyId: number,
  params?: PaginationParams & { franchise_id?: number }
) => {
  return useQuery({
    queryKey: ['pos', 'refunds', companyId, params],
    queryFn: async () => {
      const response = await apiClient.pos.refunds.list(companyId, params)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useFranchiseRefunds = (
  franchiseId: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['pos', 'refunds', 'franchise', franchiseId, params],
    queryFn: async () => {
      const response = await apiClient.pos.refunds.listByFranchise(
        franchiseId,
        params
      )
      return response.data
    },
    enabled: !!franchiseId,
  })
}

// Cash Drawer queries
export const useActiveCashDrawer = (companyId: number, franchiseId?: number) => {
  return useQuery({
    queryKey: ['pos', 'cash-drawer', 'active', companyId, franchiseId],
    queryFn: async () => {
      const response = await apiClient.pos.cashDrawer.getActive(
        companyId,
        franchiseId
      )
      return response.data
    },
    enabled: !!companyId,
    retry: false, // Don't retry if no active drawer
  })
}

export const useActiveFranchiseCashDrawer = (franchiseId: number) => {
  return useQuery({
    queryKey: ['pos', 'cash-drawer', 'active', 'franchise', franchiseId],
    queryFn: async () => {
      const response = await apiClient.pos.cashDrawer.getActiveFranchise(
        franchiseId
      )
      return response.data
    },
    enabled: !!franchiseId,
    retry: false,
  })
}

export const useCashDrawers = (
  companyId: number,
  params?: PaginationParams & { franchise_id?: number }
) => {
  return useQuery({
    queryKey: ['pos', 'cash-drawer', 'list', companyId, params],
    queryFn: async () => {
      const response = await apiClient.pos.cashDrawer.list(companyId, params)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useFranchiseCashDrawers = (
  franchiseId: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['pos', 'cash-drawer', 'list', 'franchise', franchiseId, params],
    queryFn: async () => {
      const response = await apiClient.pos.cashDrawer.listByFranchise(
        franchiseId,
        params
      )
      return response.data
    },
    enabled: !!franchiseId,
  })
}

export const useOpenCashDrawer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number
      data: OpenCashDrawerRequest
    }) => {
      const response = await apiClient.pos.cashDrawer.open(companyId, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'cash-drawer', 'active', variables.companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pos', 'cash-drawer', 'list', variables.companyId],
      })
    },
  })
}

export const useCloseCashDrawer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      drawerId,
      data,
    }: {
      companyId: number
      drawerId: number
      data: CloseCashDrawerRequest
    }) => {
      const response = await apiClient.pos.cashDrawer.close(
        companyId,
        drawerId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pos', 'cash-drawer', 'active', variables.companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['pos', 'cash-drawer', 'list', variables.companyId],
      })
    },
  })
}

// Sales Report query
export const useSalesReport = (
  companyId: number,
  data: SalesReportRequest,
  enabled = true
) => {
  return useQuery({
    queryKey: ['pos', 'reports', 'sales', companyId, data],
    queryFn: async () => {
      const response = await apiClient.pos.reports.sales(companyId, data)
      return response.data
    },
    enabled: enabled && !!companyId && !!data.start_date && !!data.end_date,
  })
}

export const useFranchiseSalesReport = (
  franchiseId: number,
  data: SalesReportRequest,
  enabled = true
) => {
  return useQuery({
    queryKey: ['pos', 'reports', 'sales', 'franchise', franchiseId, data],
    queryFn: async () => {
      const response = await apiClient.pos.reports.salesByFranchise(
        franchiseId,
        data
      )
      return response.data
    },
    enabled: enabled && !!franchiseId && !!data.start_date && !!data.end_date,
  })
}

