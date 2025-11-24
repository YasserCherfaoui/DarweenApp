import { apiClient } from '@/lib/api-client'
import type { CreateYalidineConfigRequest, UpdateYalidineConfigRequest } from '@/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useYalidineConfigs = (companyId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'yalidine-configs'],
    queryFn: async () => {
      const response = await apiClient.yalidineConfigs.list(companyId)
      return response.data?.configs || []
    },
    enabled: !!companyId,
  })
}

export const useYalidineConfig = (companyId: number, configId: number) => {
  return useQuery({
    queryKey: ['companies', companyId, 'yalidine-configs', configId],
    queryFn: async () => {
      const response = await apiClient.yalidineConfigs.get(companyId, configId)
      return response.data
    },
    enabled: !!companyId && !!configId,
  })
}

export const useCreateYalidineConfig = (companyId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateYalidineConfigRequest) => 
      apiClient.yalidineConfigs.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'yalidine-configs'] })
      toast.success('Yalidine config created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create Yalidine config')
    },
  })
}

export const useUpdateYalidineConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateYalidineConfigRequest) => 
      apiClient.yalidineConfigs.update(companyId, configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'yalidine-configs'] })
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'yalidine-configs', configId] })
      toast.success('Yalidine config updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update Yalidine config')
    },
  })
}

export const useDeleteYalidineConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.yalidineConfigs.delete(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'yalidine-configs'] })
      toast.success('Yalidine config deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete Yalidine config')
    },
  })
}

export const useSetDefaultYalidineConfig = (companyId: number, configId: number) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => apiClient.yalidineConfigs.setDefault(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', companyId, 'yalidine-configs'] })
      toast.success('Default Yalidine config set successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set default Yalidine config')
    },
  })
}

export const useTestYalidineConnection = (companyId: number) => {
  return useMutation({
    mutationFn: () => apiClient.yalidine.getCenters(companyId),
    onSuccess: (response) => {
      const centersCount = response.data?.data?.length || 0
      toast.success(`Connection successful! Found ${centersCount} center(s)`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to test Yalidine connection')
    },
  })
}

