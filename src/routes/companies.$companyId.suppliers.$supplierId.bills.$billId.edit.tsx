import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { SupplierBillForm } from '@/components/suppliers/SupplierBillForm'
import { useSupplierBill, useUpdateSupplierBill } from '@/hooks/queries/use-supplier-bills'
import { useSupplier } from '@/hooks/queries/use-suppliers'
import { ArrowLeft } from 'lucide-react'
import type { UpdateSupplierBillRequest } from '@/types/api'
import { rootRoute } from '@/main'
import { useToast } from '@/hooks/use-toast'

export const EditSupplierBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId/bills/$billId/edit',
  component: EditSupplierBillPage,
})

function EditSupplierBillPage() {
  const { companyId, supplierId, billId } = useParams({
    from: '/companies/$companyId/suppliers/$supplierId/bills/$billId/edit',
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)
  const billIdNum = parseInt(billId)

  const { data: supplier } = useSupplier(companyIdNum, supplierIdNum)
  const { data: bill, isLoading: isLoadingBill } = useSupplierBill(
    companyIdNum,
    supplierIdNum,
    billIdNum
  )
  const updateBill = useUpdateSupplierBill()

  const handleSubmit = (data: UpdateSupplierBillRequest) => {
    if (!bill) return

    updateBill.mutate(
      {
        companyId: companyIdNum,
        supplierId: supplierIdNum,
        billId: billIdNum,
        data,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
            params: { companyId, supplierId, billId },
          })
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to update bill',
            description: error.message || 'Failed to update supplier bill',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (isLoadingBill) {
    return (
      <RoleBasedLayout>
        <Loading fullScreen={false} />
      </RoleBasedLayout>
    )
  }

  if (!bill) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>Bill not found</div>
        </div>
      </RoleBasedLayout>
    )
  }

  if (bill.bill_status !== 'draft') {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-2">
              Cannot edit this bill
            </p>
            <p className="text-gray-500">
              Only draft bills can be edited. This bill is {bill.bill_status}.
            </p>
            <Button
              className="mt-4"
              onClick={() =>
                navigate({
                  to: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
                  params: { companyId, supplierId, billId },
                })
              }
            >
              View Bill Details
            </Button>
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() =>
              navigate({
                to: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
                params: { companyId, supplierId, billId },
              })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Supplier Bill</h1>
            <p className="text-muted-foreground">
              Edit bill #{bill.bill_number} for {supplier?.data?.name || 'supplier'}
            </p>
          </div>
        </div>

        <SupplierBillForm
          companyId={companyIdNum}
          supplierId={supplierIdNum}
          initialData={{
            items: bill.items || [],
            notes: bill.notes,
            paid_amount: bill.paid_amount,
          }}
          onSubmit={handleSubmit}
          isLoading={updateBill.isPending}
          submitLabel="Update Bill"
          isEdit={true}
        />
      </div>
    </RoleBasedLayout>
  )
}

