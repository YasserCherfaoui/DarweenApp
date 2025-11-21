import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { 
  CreateProductRequest, 
  UpdateProductRequest,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
  BulkCreateProductVariantsRequest,
  PaginationParams,
  AdjustStockRequest,
  UpdateStockRequest,
} from '@/types/api'
import { toast } from 'sonner'

// Products
export const useProducts = (companyId: number, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['products', companyId, params],
    queryFn: async () => {
      const response = await apiClient.products.list(companyId, params)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useProduct = (companyId: number, productId: number) => {
  return useQuery({
    queryKey: ['products', companyId, productId],
    queryFn: async () => {
      const response = await apiClient.products.get(companyId, productId)
      return response.data
    },
    enabled: !!companyId && !!productId,
  })
}

export const useCreateProduct = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductRequest) => apiClient.products.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId] })
      toast.success('Product created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product')
    },
  })
}

export const useUpdateProduct = (companyId: number, productId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProductRequest) => apiClient.products.update(companyId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      toast.success('Product updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product')
    },
  })
}

export const useDeleteProduct = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productId: number) => apiClient.products.delete(companyId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId] })
      toast.success('Product deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product')
    },
  })
}

// Product Variants
export const useProductVariants = (companyId: number, productId: number) => {
  return useQuery({
    queryKey: ['products', companyId, productId, 'variants'],
    queryFn: async () => {
      const response = await apiClient.productVariants.list(companyId, productId)
      return response.data || []
    },
    enabled: !!companyId && !!productId,
  })
}

export const useCreateProductVariant = (companyId: number, productId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductVariantRequest) => 
      apiClient.productVariants.create(companyId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      toast.success('Variant created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create variant')
    },
  })
}

export const useBulkCreateProductVariants = (companyId: number, productId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: BulkCreateProductVariantsRequest) => 
      apiClient.productVariants.bulkCreate(companyId, productId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      const count = response.data?.created_count || 0
      toast.success(`${count} variant${count !== 1 ? 's' : ''} created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create variants')
    },
  })
}

export const useUpdateProductVariant = (companyId: number, productId: number, variantId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProductVariantRequest) => 
      apiClient.productVariants.update(companyId, productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      toast.success('Variant updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update variant')
    },
  })
}

export const useDeleteProductVariant = (companyId: number, productId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (variantId: number) => 
      apiClient.productVariants.delete(companyId, productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      toast.success('Variant deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete variant')
    },
  })
}

export const useUpdateVariantStock = (companyId: number, productId: number, variantId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateStockRequest) => 
      apiClient.productVariants.updateStock(companyId, productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      toast.success('Stock updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stock')
    },
  })
}

export const useAdjustVariantStock = (companyId: number, productId: number, variantId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AdjustStockRequest) => 
      apiClient.productVariants.adjustStock(companyId, productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId] })
      queryClient.invalidateQueries({ queryKey: ['products', companyId, productId, 'variants'] })
      toast.success('Stock adjusted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock')
    },
  })
}



