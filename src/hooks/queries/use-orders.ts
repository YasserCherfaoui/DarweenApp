import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  ConfirmOrderRequest,
  UpdateOrderStatusRequest,
  CreateClientStatusRequest,
  CreateQualificationRequest,
  UpdateQualificationRequest,
  CreateShopifyWebhookConfigRequest,
  UpdateShopifyWebhookConfigRequest,
  CreateWooCommerceWebhookConfigRequest,
  UpdateWooCommerceWebhookConfigRequest,
  OrderFilters,
} from '@/types/api'
import { toast } from 'sonner'

// Orders
export const useOrders = (companyId: number, filters?: OrderFilters) => {
  return useQuery({
    queryKey: ['orders', companyId, filters],
    queryFn: async () => {
      const response = await apiClient.orders.list(companyId, filters)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useOrder = (companyId: number, orderId: number) => {
  return useQuery({
    queryKey: ['orders', companyId, orderId],
    queryFn: async () => {
      const response = await apiClient.orders.get(companyId, orderId)
      return response.data
    },
    enabled: !!companyId && !!orderId,
  })
}

export const useCreateOrder = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      apiClient.orders.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      toast.success('Order created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create order')
    },
  })
}

export const useUpdateOrder = (companyId: number, orderId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrderRequest) =>
      apiClient.orders.update(companyId, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      toast.success('Order updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order')
    },
  })
}

export const useUpdateOrderStatus = (companyId: number, orderId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateOrderStatusRequest) =>
      apiClient.orders.updateStatus(companyId, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      toast.success('Order status updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update order status')
    },
  })
}

export const useConfirmOrder = (companyId: number, orderId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConfirmOrderRequest) =>
      apiClient.orders.confirm(companyId, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      toast.success('Order confirmed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to confirm order')
    },
  })
}

export const useCancelOrder = (companyId: number, orderId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.orders.cancel(companyId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      toast.success('Order cancelled successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order')
    },
  })
}

export const useRelaunchOrder = (companyId: number, orderId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiClient.orders.relaunch(companyId, orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      toast.success('Order relaunched successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to relaunch order')
    },
  })
}

// Client Status
export const useAddClientStatus = (
  companyId: number,
  orderId: number
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientStatusRequest) =>
      apiClient.orders.addClientStatus(companyId, orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['orders', companyId, orderId],
      })
      queryClient.invalidateQueries({
        queryKey: ['clientStatuses', companyId, orderId],
      })
      toast.success('Client status added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add client status')
    },
  })
}

export const useClientStatuses = (companyId: number, orderId: number) => {
  return useQuery({
    queryKey: ['clientStatuses', companyId, orderId],
    queryFn: async () => {
      const response = await apiClient.orders.listClientStatuses(
        companyId,
        orderId
      )
      return response.data
    },
    enabled: !!companyId && !!orderId,
  })
}

// Qualifications
export const useQualifications = (companyId: number) => {
  return useQuery({
    queryKey: ['qualifications', companyId],
    queryFn: async () => {
      const response = await apiClient.orders.qualifications.list(companyId)
      return response.data
    },
    enabled: !!companyId,
  })
}

export const useCreateQualification = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateQualificationRequest) =>
      apiClient.orders.qualifications.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['qualifications', companyId],
      })
      toast.success('Qualification created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create qualification')
    },
  })
}

export const useUpdateQualification = (
  companyId: number,
  qualificationId: number
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateQualificationRequest) =>
      apiClient.orders.qualifications.update(companyId, qualificationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['qualifications', companyId],
      })
      toast.success('Qualification updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update qualification')
    },
  })
}

export const useDeleteQualification = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (qualificationId: number) =>
      apiClient.orders.qualifications.delete(companyId, qualificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['qualifications', companyId],
      })
      toast.success('Qualification deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete qualification')
    },
  })
}

// Webhook Configs
export const useCreateShopifyWebhookConfig = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShopifyWebhookConfigRequest) =>
      apiClient.orders.shopifyWebhookConfigs.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shopifyWebhookConfigs', companyId],
      })
      toast.success('Shopify webhook config created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create Shopify webhook config')
    },
  })
}

export const useUpdateShopifyWebhookConfig = (
  companyId: number,
  configId: number
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateShopifyWebhookConfigRequest) =>
      apiClient.orders.shopifyWebhookConfigs.update(companyId, configId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shopifyWebhookConfigs', companyId],
      })
      toast.success('Shopify webhook config updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update Shopify webhook config')
    },
  })
}

export const useDeleteShopifyWebhookConfig = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (configId: number) =>
      apiClient.orders.shopifyWebhookConfigs.delete(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shopifyWebhookConfigs', companyId],
      })
      toast.success('Shopify webhook config deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete Shopify webhook config')
    },
  })
}

export const useCreateWooCommerceWebhookConfig = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWooCommerceWebhookConfigRequest) =>
      apiClient.orders.woocommerceWebhookConfigs.create(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['woocommerceWebhookConfigs', companyId],
      })
      toast.success('WooCommerce webhook config created successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Failed to create WooCommerce webhook config'
      )
    },
  })
}

export const useUpdateWooCommerceWebhookConfig = (
  companyId: number,
  configId: number
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateWooCommerceWebhookConfigRequest) =>
      apiClient.orders.woocommerceWebhookConfigs.update(
        companyId,
        configId,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['woocommerceWebhookConfigs', companyId],
      })
      toast.success('WooCommerce webhook config updated successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Failed to update WooCommerce webhook config'
      )
    },
  })
}

export const useDeleteWooCommerceWebhookConfig = (companyId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (configId: number) =>
      apiClient.orders.woocommerceWebhookConfigs.delete(companyId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['woocommerceWebhookConfigs', companyId],
      })
      toast.success('WooCommerce webhook config deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Failed to delete WooCommerce webhook config'
      )
    },
  })
}

// Delivery Fee
export const useDeliveryFee = (
  companyId: number,
  params: {
    provider: string
    deliveryType: 'home' | 'stop_desk'
    communeId?: number
    centerId?: number
    fromWilayaId?: number
    shippingWilayaId?: number
  }
) => {
  return useQuery({
    queryKey: [
      'deliveryFee',
      companyId,
      params.provider,
      params.deliveryType,
      params.communeId,
      params.centerId,
      params.fromWilayaId,
    ],
    queryFn: async () => {
      if (!params.shippingWilayaId || !params.fromWilayaId) {
        return null
      }

      if (params.deliveryType === 'home' && params.communeId) {
        const response = await apiClient.orders.getDeliveryFee(companyId, {
          provider: params.provider,
          commune_id: params.communeId,
          from_wilaya_id: params.fromWilayaId,
        })
        return response.data
      }

      if (params.deliveryType === 'stop_desk' && params.centerId) {
        const response = await apiClient.orders.getDeliveryFee(companyId, {
          provider: params.provider,
          center_id: params.centerId,
          from_wilaya_id: params.fromWilayaId,
        })
        return response.data
      }

      return null
    },
    enabled:
      !!companyId &&
      !!params.shippingWilayaId &&
      !!params.fromWilayaId &&
      ((params.deliveryType === 'home' && !!params.communeId) ||
        (params.deliveryType === 'stop_desk' && !!params.centerId)),
  })
}



