import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { SendEmailRequest } from '@/types/api'
import { toast } from 'sonner'

export function useSendEmail(companyId: number) {
  return useMutation({
    mutationFn: async (data: SendEmailRequest) => {
      const response = await apiClient.emails.send(companyId, data)
      return response
    },
    onSuccess: () => {
      toast.success('Email queued successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to send email')
    },
  })
}

