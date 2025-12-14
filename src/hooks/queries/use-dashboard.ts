import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export const useDashboardAnalytics = (companyId: number) => {
  return useQuery({
    queryKey: ['dashboard', 'analytics', companyId],
    queryFn: async () => {
      const response = await apiClient.companies.getDashboardAnalytics(companyId)
      return response.data
    },
    enabled: !!companyId,
  })
}

