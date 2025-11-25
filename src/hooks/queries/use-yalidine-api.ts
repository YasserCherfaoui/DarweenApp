import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export const useYalidineWilayas = (companyId: number) => {
  return useQuery({
    queryKey: ['yalidine', 'wilayas', companyId],
    queryFn: async () => {
      const response = await apiClient.yalidine.getWilayas(companyId)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useYalidineCommunes = (
  companyId: number,
  wilayaId?: number
) => {
  return useQuery({
    queryKey: ['yalidine', 'communes', companyId, wilayaId],
    queryFn: async () => {
      const queryParams = wilayaId ? { wilaya_id: wilayaId } : undefined
      const response = await apiClient.yalidine.getCommunes(companyId, queryParams)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useYalidineCenters = (
  companyId: number,
  wilayaId?: number
) => {
  return useQuery({
    queryKey: ['yalidine', 'centers', companyId, wilayaId],
    queryFn: async () => {
      const queryParams = wilayaId ? { wilaya_id: wilayaId } : undefined
      const response = await apiClient.yalidine.getCenters(companyId, queryParams)
      return response.data
    },
    enabled: !!companyId,
  })
}



