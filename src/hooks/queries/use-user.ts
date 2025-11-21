import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ChangePasswordRequest } from '@/types/api'
import { toast } from 'sonner'

export const useUser = () => {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await apiClient.users.getMe()
      return response.data
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { first_name?: string; last_name?: string }) => 
      apiClient.users.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => 
      apiClient.users.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })
}

