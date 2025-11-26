import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import type {
  CreateExitBillRequest,
  CreateEntryBillRequest,
  VerifyEntryBillRequest,
  UpdateExitBillItemsRequest,
  PaginationParams,
} from '@/types/api'
import { toast } from 'sonner'

// Warehouse Bill queries (Company level - Exit bills)
export const useWarehouseBills = (
  companyId: number,
  params?: PaginationParams & {
    franchise_id?: number
    status?: string
    bill_type?: string
    date_from?: string
    date_to?: string
  }
) => {
  return useQuery({
    queryKey: ['warehouse-bills', 'company', companyId, params],
    queryFn: async () => {
      const response = await apiClient.warehouseBills.listByCompany(
        companyId,
        params
      )
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useWarehouseBill = (
  companyId: number,
  billId: number
) => {
  return useQuery({
    queryKey: ['warehouse-bills', 'company', companyId, billId],
    queryFn: async () => {
      const response = await apiClient.warehouseBills.getByCompany(
        companyId,
        billId
      )
      return response.data
    },
    enabled: !!companyId && !!billId,
  })
}

export const useCreateExitBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: number
      data: CreateExitBillRequest
    }) => {
      const response = await apiClient.warehouseBills.createExit(
        companyId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId],
      })
      toast.success('Exit bill created successfully')
    },
    onError: (_error: Error) => {
      // Error is handled in the component with ErrorDialog
      // Don't show toast for errors
    },
  })
}

export const useCompleteExitBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      billId,
    }: {
      companyId: number
      billId: number
    }) => {
      const response = await apiClient.warehouseBills.completeExit(
        companyId,
        billId
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['inventory'],
      })
      toast.success('Exit bill completed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete exit bill')
    },
  })
}

export const useCancelWarehouseBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      billId,
    }: {
      companyId: number
      billId: number
    }) => {
      await apiClient.warehouseBills.cancel(companyId, billId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId],
      })
      toast.success('Warehouse bill cancelled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel warehouse bill')
    },
  })
}

export const useUpdateExitBillItems = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      billId,
      data,
    }: {
      companyId: number
      billId: number
      data: UpdateExitBillItemsRequest
    }) => {
      const response = await apiClient.warehouseBills.updateExitBillItems(
        companyId,
        billId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId],
      })
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company', variables.companyId, variables.billId],
      })
      toast.success('Exit bill items updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update exit bill items')
    },
  })
}

// Warehouse Bill queries (Franchise level - Entry bills)
export const useFranchiseWarehouseBills = (
  franchiseId: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['warehouse-bills', 'franchise', franchiseId, params],
    queryFn: async () => {
      const response = await apiClient.warehouseBills.listByFranchise(
        franchiseId,
        params
      )
      return response.data
    },
    enabled: !!franchiseId,
  })
}

export const useFranchiseWarehouseBill = (
  franchiseId: number,
  billId: number
) => {
  return useQuery({
    queryKey: ['warehouse-bills', 'franchise', franchiseId, billId],
    queryFn: async () => {
      const response = await apiClient.warehouseBills.getByFranchise(
        franchiseId,
        billId
      )
      return response.data
    },
    enabled: !!franchiseId && !!billId,
  })
}

export const useCreateEntryBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      franchiseId,
      data,
    }: {
      franchiseId: number
      data: CreateEntryBillRequest
    }) => {
      const response = await apiClient.warehouseBills.createEntry(
        franchiseId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'franchise', variables.franchiseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'company'],
      })
      queryClient.invalidateQueries({
        queryKey: ['inventory'],
      })
      toast.success('Entry bill created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create entry bill')
    },
  })
}

export const useVerifyEntryBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      franchiseId,
      billId,
      data,
    }: {
      franchiseId: number
      billId: number
      data: VerifyEntryBillRequest
    }) => {
      const response = await apiClient.warehouseBills.verifyEntry(
        franchiseId,
        billId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'franchise', variables.franchiseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'franchise', variables.franchiseId, variables.billId],
      })
      toast.success('Entry bill verified successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify entry bill')
    },
  })
}

export const useCompleteEntryBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      franchiseId,
      billId,
    }: {
      franchiseId: number
      billId: number
    }) => {
      const response = await apiClient.warehouseBills.completeEntry(
        franchiseId,
        billId
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'franchise', variables.franchiseId],
      })
      queryClient.invalidateQueries({
        queryKey: ['warehouse-bills', 'franchise', variables.franchiseId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['inventory'],
      })
      toast.success('Entry bill completed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete entry bill')
    },
  })
}

// Search products for exit bill with debouncing
export const useSearchProductsForExitBill = (
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
    queryKey: ['warehouse-bills', 'search', companyId, franchiseId, debouncedQuery],
    queryFn: async () => {
      if (!franchiseId || !debouncedQuery.trim()) {
        return { data: [] }
      }
      const response = await apiClient.warehouseBills.searchProductsForExitBill(
        companyId,
        debouncedQuery,
        franchiseId
      )
      return response
    },
    enabled: !!companyId && !!franchiseId && debouncedQuery.trim().length > 0,
  })
}

