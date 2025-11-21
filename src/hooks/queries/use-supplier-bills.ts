import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type {
  SupplierBill,
  CreateSupplierBillRequest,
  UpdateSupplierBillRequest,
  SupplierBillItemRequest,
  SupplierPayment,
  RecordSupplierPaymentRequest,
  SupplierOutstandingBalance,
  PaginationParams,
} from '@/types/api'
import { toast } from 'sonner'

// Supplier Bill queries
export const useSupplierBills = (
  companyId: number,
  supplierId: number,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: ['suppliers', 'bills', companyId, supplierId, params],
    queryFn: async () => {
      const response = await apiClient.suppliers.bills.list(
        companyId,
        supplierId,
        params
      )
      return response.data
    },
    enabled: !!companyId && !!supplierId,
  })
}

export const useSupplierBill = (
  companyId: number,
  supplierId: number,
  billId: number
) => {
  return useQuery({
    queryKey: ['suppliers', 'bills', companyId, supplierId, billId],
    queryFn: async () => {
      const response = await apiClient.suppliers.bills.get(
        companyId,
        supplierId,
        billId
      )
      return response.data
    },
    enabled: !!companyId && !!supplierId && !!billId,
  })
}

export const useCreateSupplierBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      data,
    }: {
      companyId: number
      supplierId: number
      data: CreateSupplierBillRequest
    }) => {
      const response = await apiClient.suppliers.bills.create(
        companyId,
        supplierId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'outstanding', variables.companyId, variables.supplierId],
      })
      toast.success('Supplier bill created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier bill')
    },
  })
}

export const useUpdateSupplierBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      billId,
      data,
    }: {
      companyId: number
      supplierId: number
      billId: number
      data: UpdateSupplierBillRequest
    }) => {
      const response = await apiClient.suppliers.bills.update(
        companyId,
        supplierId,
        billId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'outstanding', variables.companyId, variables.supplierId],
      })
      toast.success('Supplier bill updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier bill')
    },
  })
}

export const useDeleteSupplierBill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      billId,
    }: {
      companyId: number
      supplierId: number
      billId: number
    }) => {
      await apiClient.suppliers.bills.delete(companyId, supplierId, billId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'outstanding', variables.companyId, variables.supplierId],
      })
      toast.success('Supplier bill deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier bill')
    },
  })
}

// Bill Item mutations
export const useAddBillItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      billId,
      data,
    }: {
      companyId: number
      supplierId: number
      billId: number
      data: SupplierBillItemRequest
    }) => {
      const response = await apiClient.suppliers.bills.addItem(
        companyId,
        supplierId,
        billId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      toast.success('Bill item added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add bill item')
    },
  })
}

export const useUpdateBillItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      billId,
      itemId,
      data,
    }: {
      companyId: number
      supplierId: number
      billId: number
      itemId: number
      data: SupplierBillItemRequest
    }) => {
      const response = await apiClient.suppliers.bills.updateItem(
        companyId,
        supplierId,
        billId,
        itemId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      toast.success('Bill item updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update bill item')
    },
  })
}

export const useRemoveBillItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      billId,
      itemId,
    }: {
      companyId: number
      supplierId: number
      billId: number
      itemId: number
    }) => {
      await apiClient.suppliers.bills.removeItem(
        companyId,
        supplierId,
        billId,
        itemId
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId, variables.billId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      toast.success('Bill item removed successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove bill item')
    },
  })
}

// Supplier Payment queries
export const useRecordSupplierPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      companyId,
      supplierId,
      data,
    }: {
      companyId: number
      supplierId: number
      data: RecordSupplierPaymentRequest
    }) => {
      const response = await apiClient.suppliers.payments.record(
        companyId,
        supplierId,
        data
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'bills', variables.companyId, variables.supplierId],
      })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', 'outstanding', variables.companyId, variables.supplierId],
      })
      toast.success('Supplier payment recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record supplier payment')
    },
  })
}

// Outstanding Balance query
export const useSupplierOutstandingBalance = (
  companyId: number,
  supplierId: number
) => {
  return useQuery({
    queryKey: ['suppliers', 'outstanding', companyId, supplierId],
    queryFn: async () => {
      const response = await apiClient.suppliers.outstandingBalance.get(
        companyId,
        supplierId
      )
      return response.data
    },
    enabled: !!companyId && !!supplierId,
  })
}

