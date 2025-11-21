import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { SupplierBillForm } from '@/components/suppliers/SupplierBillForm'
import { useCreateSupplierBill } from '@/hooks/queries/use-supplier-bills'
import { useSupplier } from '@/hooks/queries/use-suppliers'
import { ArrowLeft } from 'lucide-react'
import type { CreateSupplierBillRequest } from '@/types/api'
import { rootRoute } from '@/main'
import { useToast } from '@/hooks/use-toast'

export const NewSupplierBillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId/bills/new',
  component: NewSupplierBillPage,
})

function NewSupplierBillPage() {
  const { companyId, supplierId } = useParams({ from: '/companies/$companyId/suppliers/$supplierId/bills/new' })
  const navigate = useNavigate()
  const { toast } = useToast()
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)

  const { data: supplier } = useSupplier(companyIdNum, supplierIdNum)
  const createBill = useCreateSupplierBill()

  const handleSubmit = (data: CreateSupplierBillRequest) => {
    createBill.mutate(
      {
        companyId: companyIdNum,
        supplierId: supplierIdNum,
        data,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/companies/$companyId/suppliers/$supplierId/bills',
            params: { companyId, supplierId },
          })
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to create bill',
            description: error.message || 'Failed to create supplier bill',
            variant: 'destructive',
          })
        },
      }
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
                to: '/companies/$companyId/suppliers/$supplierId/bills',
                params: { companyId, supplierId },
              })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Supplier Bill</h1>
            <p className="text-muted-foreground">
              Create a new bill for {supplier?.data?.name || 'supplier'}
            </p>
          </div>
        </div>

        <SupplierBillForm
          companyId={companyIdNum}
          supplierId={supplierIdNum}
          onSubmit={handleSubmit}
          isLoading={createBill.isPending}
          submitLabel="Create Bill"
        />
      </div>
    </RoleBasedLayout>
  )
}

