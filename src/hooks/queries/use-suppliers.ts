import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateSupplierRequest, UpdateSupplierRequest, PaginationParams } from '@/types/api'
import { toast } from 'sonner'

export const useSuppliers = (companyId: number, params?: PaginationParams) => {
  // Set default pagination values to meet backend validation requirements (min=1)
  const paginationParams: PaginationParams = {
    page: params?.page || 1,
    limit: params?.limit || 20,
  }

  return useQuery({
    queryKey: ['companies', companyId, 'suppliers', paginationParams],
    queryFn: async () => {
      const response = await apiClient.suppliers.list(companyId, paginationParams)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useSupplier = (companyId: number, supplierId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'suppliers', supplierId],
    queryFn: async () => {
      const response = await apiClient.suppliers.get(companyId, supplierId)
      return response.data
    },
    enabled: !!companyId && !!supplierId,
  })
}

export const useCreateSupplier = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSupplierRequest) => apiClient.suppliers.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'suppliers'] })
      toast.success('Supplier created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier')
    },
  })
}

export const useUpdateSupplier = (companyId: number, supplierId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateSupplierRequest) => apiClient.suppliers.update(companyId, supplierId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'suppliers', supplierId] })
      toast.success('Supplier updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier')
    },
  })
}

export const useDeleteSupplier = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (supplierId: number) => apiClient.suppliers.delete(companyId, supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'suppliers'] })
      toast.success('Supplier deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier')
    },
  })
}

export const useSupplierProducts = (companyId: number, supplierId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'suppliers', supplierId, 'products'],
    queryFn: async () => {
      const response = await apiClient.suppliers.getProducts(companyId, supplierId)
      return response.data
    },
    enabled: !!companyId && !!supplierId,
  })
}



