import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  CreateInventoryRequest,
  UpdateInventoryStockRequest,
  AdjustInventoryStockRequest,
  ReserveStockRequest,
  ReleaseStockRequest,
  MovementFilterParams,
} from '@/types/api'
import { toast } from 'sonner'

// Company inventory
export const useCompanyInventory = (companyId: number) => {
  return useQuery({
    queryKey: ['inventory', 'company', companyId],
    queryFn: async () => {
      const response = await apiClient.inventory.getByCompany(companyId)
      return response.data || []
    },
    enabled: !!companyId,
  })
}

// Franchise inventory
export const useFranchiseInventory = (franchiseId: number) => {
  return useQuery({
    queryKey: ['inventory', 'franchise', franchiseId],
    queryFn: async () => {
      const response = await apiClient.inventory.getByFranchise(franchiseId)
      return response.data || []
    },
    enabled: !!franchiseId,
  })
}

// Create inventory
export const useCreateInventory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInventoryRequest) => apiClient.inventory.create(data),
    onSuccess: (_, variables) => {
      // Invalidate both company and franchise queries
      if (variables.company_id) {
        queryClient.invalidateQueries({ queryKey: ['inventory', 'company', variables.company_id] })
      }
      if (variables.franchise_id) {
        queryClient.invalidateQueries({ queryKey: ['inventory', 'franchise', variables.franchise_id] })
      }
      toast.success('Inventory created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create inventory')
    },
  })
}

// Update inventory stock
export const useUpdateInventoryStock = (inventoryId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateInventoryStockRequest) =>
      apiClient.inventory.updateStock(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock')
    },
  })
}

// Adjust inventory stock
export const useAdjustInventoryStock = (inventoryId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AdjustInventoryStockRequest) =>
      apiClient.inventory.adjustStock(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock adjusted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock')
    },
  })
}

// Reserve stock
export const useReserveStock = (inventoryId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReserveStockRequest) =>
      apiClient.inventory.reserve(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock reserved successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reserve stock')
    },
  })
}

// Release stock
export const useReleaseStock = (inventoryId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReleaseStockRequest) =>
      apiClient.inventory.release(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Stock released successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to release stock')
    },
  })
}

// Get inventory movements (now returns paginated response)
export const useInventoryMovements = (
  inventoryId: number,
  params?: MovementFilterParams
) => {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'movements', params],
    queryFn: async () => {
      const response = await apiClient.inventory.getMovements(inventoryId, params)
      return response.data
    },
    enabled: !!inventoryId,
  })
}

// Get inventory movements with filters
export const useInventoryMovementsWithFilters = (
  inventoryId: number,
  params?: MovementFilterParams
) => {
  return useQuery({
    queryKey: ['inventory', inventoryId, 'movements', 'filtered', params],
    queryFn: async () => {
      const response = await apiClient.inventory.getMovementsWithFilters(inventoryId, params)
      return response.data
    },
    enabled: !!inventoryId,
  })
}

