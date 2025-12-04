import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  ListCompaniesAdminRequest,
  ListUsersAdminRequest,
  UpdateCompanyAdminRequest,
  UpdateUserAdminRequest,
  UpdateSubscriptionAdminRequest,
  UpdateSystemSettingsRequest,
  PaginationParams,
} from '@/types/api'
import { toast } from 'sonner'

// Companies
export const useAdminCompanies = (params?: ListCompaniesAdminRequest) => {
  return useQuery({
    queryKey: ['admin', 'companies', params],
    queryFn: async () => {
      const response = await apiClient.admin.companies.list(params)
      return response.data
    },
  })
}

export const useAdminCompany = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'companies', id],
    queryFn: async () => {
      const response = await apiClient.admin.companies.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpdateAdminCompany = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCompanyAdminRequest) =>
      apiClient.admin.companies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies', id] })
      toast.success('Company updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update company')
    },
  })
}

// Users
export const useAdminUsers = (params?: ListUsersAdminRequest) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const response = await apiClient.admin.users.list(params)
      return response.data
    },
  })
}

export const useAdminUser = (id: number) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await apiClient.admin.users.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useUpdateAdminUser = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserAdminRequest) =>
      apiClient.admin.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] })
      toast.success('User updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })
}

// Subscriptions
export const useAdminSubscriptions = (
  params?: PaginationParams & { plan_type?: string }
) => {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: async () => {
      const response = await apiClient.admin.subscriptions.list(params)
      return response.data
    },
  })
}

export const useUpdateAdminSubscription = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSubscriptionAdminRequest) =>
      apiClient.admin.subscriptions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      toast.success('Subscription updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription')
    },
  })
}

// Analytics
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const response = await apiClient.admin.analytics.getOverview()
      return response.data
    },
  })
}

// System Settings
export const useAdminSystemSettings = () => {
  return useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: async () => {
      const response = await apiClient.admin.systemSettings.get()
      return response.data
    },
  })
}

export const useUpdateAdminSystemSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSystemSettingsRequest) =>
      apiClient.admin.systemSettings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'system-settings'] })
      toast.success('System settings updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update system settings')
    },
  })
}



