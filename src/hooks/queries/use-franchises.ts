import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { 
  CreateFranchiseRequest, 
  UpdateFranchiseRequest,
  SetFranchisePricingRequest,
  BulkSetFranchisePricingRequest,
  AddUserToFranchiseRequest,
  AddUserToFranchiseResponse,
} from '@/types/api'
import { toast } from 'sonner'

// Query hooks for fetching data

export const useCompanyFranchises = (companyId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'franchises'],
    queryFn: async () => {
      const response = await apiClient.franchises.list(companyId)
      return response.data || []
    },
    enabled: !!companyId,
  })
}

export const useFranchises = () => {
  return useQuery({
    queryKey: ['franchises'],
    queryFn: async () => {
      const response = await apiClient.franchises.listAll()
      return response.data || []
    },
  })
}

export const useFranchise = (franchiseId: number) => {
  return useQuery({
    queryKey: ['franchises', franchiseId],
    queryFn: async () => {
      const response = await apiClient.franchises.get(franchiseId)
      return response.data
    },
    enabled: !!franchiseId,
  })
}

export const useFranchisePricing = (franchiseId: number) => {
  return useQuery({
    queryKey: ['franchises', franchiseId, 'pricing'],
    queryFn: async () => {
      const response = await apiClient.franchises.getPricing(franchiseId)
      return response.data || []
    },
    enabled: !!franchiseId,
  })
}

// Mutation hooks for creating/updating data

export const useCreateFranchise = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateFranchiseRequest) => 
      apiClient.franchises.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'franchises'] })
      queryClient.invalidateQueries({ queryKey: ['franchises'] })
      toast.success('Franchise created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create franchise')
    },
  })
}

export const useUpdateFranchise = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateFranchiseRequest) => 
      apiClient.franchises.update(franchiseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId] })
      queryClient.invalidateQueries({ queryKey: ['franchises'] })
      toast.success('Franchise updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update franchise')
    },
  })
}

export const useSetFranchisePricing = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SetFranchisePricingRequest) => 
      apiClient.franchises.setPricing(franchiseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'pricing'] })
      toast.success('Pricing set successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set pricing')
    },
  })
}

export const useBulkSetFranchisePricing = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: BulkSetFranchisePricingRequest) => 
      apiClient.franchises.bulkSetPricing(franchiseId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'pricing'] })
      const count = response.data?.updated_count || 0
      toast.success(`Pricing set for ${count} variant${count !== 1 ? 's' : ''} successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set pricing')
    },
  })
}

export const useDeleteFranchisePricing = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (variantId: number) => 
      apiClient.franchises.deletePricing(franchiseId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'pricing'] })
      toast.success('Pricing deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete pricing')
    },
  })
}

export const useAddUserToFranchise = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AddUserToFranchiseRequest): Promise<{ data: AddUserToFranchiseResponse }> => {
      const response = await apiClient.franchises.addUser(franchiseId, data)
      if (!response.data) {
        throw new Error('Failed to add user to franchise')
      }
      return { data: response.data }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'users'] })
      if (response.data.user_created) {
        toast.success('User created and added to franchise successfully')
      } else {
        toast.success('User added to franchise successfully')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add user')
    },
  })
}

export const useRemoveUserFromFranchise = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: number) => 
      apiClient.franchises.removeUser(franchiseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'users'] })
      toast.success('User removed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user')
    },
  })
}

export const useFranchiseUsers = (franchiseId: number) => {
  return useQuery({
    queryKey: ['franchises', franchiseId, 'users'],
    queryFn: async () => {
      const response = await apiClient.franchises.getUsers(franchiseId)
      return response.data?.users || []
    },
    enabled: !!franchiseId,
  })
}

export const useUpdateFranchiseUserRole = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => 
      apiClient.franchises.updateUserRole(franchiseId, userId, role as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role')
    },
  })
}

export const useInitializeFranchiseInventory = (franchiseId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.franchises.initializeInventory(franchiseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchises', franchiseId, 'inventory'] })
      toast.success('Inventory initialized successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initialize inventory')
    },
  })
}

