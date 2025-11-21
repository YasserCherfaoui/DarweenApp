import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { UserPortalsResponse } from '@/types/api'

export const useUserPortals = () => {
  return useQuery({
    queryKey: ['user', 'portals'],
    queryFn: async () => {
      const response = await apiClient.users.getPortals()
      return response.data as UserPortalsResponse
    },
  })
}

