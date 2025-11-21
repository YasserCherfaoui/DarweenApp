import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateCompanyRequest, UpdateCompanyRequest, AddUserToCompanyRequest } from '@/types/api'
import { toast } from 'sonner'

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiClient.companies.list()
      return response.data || []
    },
  })
}

export const useCompany = (id: number) => {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      const response = await apiClient.companies.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => apiClient.companies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create company')
    },
  })
}

export const useUpdateCompany = (id: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateCompanyRequest) => apiClient.companies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', id] })
      toast.success('Company updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update company')
    },
  })
}

export const useCompanyUsers = (companyId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'users'],
    queryFn: async () => {
      const response = await apiClient.companies.getUsers(companyId)
      return response.data?.users || []
    },
    enabled: !!companyId,
  })
}

export const useAddUserToCompany = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: AddUserToCompanyRequest) => 
      apiClient.companies.addUser(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'users'] })
      toast.success('User added to company successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add user to company')
    },
  })
}

export const useRemoveUserFromCompany = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userId: number) => 
      apiClient.companies.removeUser(companyId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'users'] })
      toast.success('User removed from company successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove user from company')
    },
  })
}

export const useUpdateCompanyUserRole = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => 
      apiClient.companies.updateUserRole(companyId, userId, role as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'users'] })
      toast.success('User role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user role')
    },
  })
}

export const useInitializeCompanyInventory = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.companies.initializeInventory(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'inventory'] })
      toast.success('Company inventory initialized successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to initialize inventory')
    },
  })
}



