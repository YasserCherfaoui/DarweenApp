import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateSMTPConfigRequest, UpdateSMTPConfigRequest } from '@/types/api'
import { toast } from 'sonner'

export const useSMTPConfigs = (companyId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'smtp-configs'],
    queryFn: async () => {
      const response = await apiClient.smtpConfigs.list(companyId)
      return response.data?.configs || []
    },
    enabled: !!companyId,
  })
}

export const useSMTPConfig = (companyId: number, configId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'smtp-configs', configId],
    queryFn: async () => {
      const response = await apiClient.smtpConfigs.get(companyId, configId)
      return response.data
    },
    enabled: !!companyId && !!configId,
  })
}

export const useCreateSMTPConfig = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSMTPConfigRequest) => 
      apiClient.smtpConfigs.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'smtp-configs'] })
      toast.success('SMTP config created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create SMTP config')
    },
  })
}

export const useUpdateSMTPConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateSMTPConfigRequest) => 
      apiClient.smtpConfigs.update(companyId, configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'smtp-configs'] })
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'smtp-configs', configId] })
      toast.success('SMTP config updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update SMTP config')
    },
  })
}

export const useDeleteSMTPConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.smtpConfigs.delete(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'smtp-configs'] })
      toast.success('SMTP config deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete SMTP config')
    },
  })
}

export const useSetDefaultSMTPConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.smtpConfigs.setDefault(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'smtp-configs'] })
      toast.success('Default SMTP config set successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default SMTP config')
    },
  })
}

