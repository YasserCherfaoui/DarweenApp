import { createRoute, useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { SupplierBillDetailsDialog } from '@/components/suppliers/SupplierBillDetailsDialog'
import { useSupplierBill } from '@/hooks/queries/use-supplier-bills'
import { useSupplier } from '@/hooks/queries/use-suppliers'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const SupplierBillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
  component: SupplierBillDetailPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      highlightedItemId: search.highlightedItemId
        ? parseInt(String(search.highlightedItemId), 10)
        : undefined,
    }
  },
})

function SupplierBillDetailPage() {
  const { companyId, supplierId, billId } = useParams({
    from: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
  })
  const search = useSearch({ from: '/companies/$companyId/suppliers/$supplierId/bills/$billId' })
  const navigate = useNavigate()
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)
  const billIdNum = parseInt(billId)

  const { data: supplier } = useSupplier(companyIdNum, supplierIdNum)
  const { data: bill } = useSupplierBill(companyIdNum, supplierIdNum, billIdNum)

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
            Back to Bills
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Bill #{bill?.bill_number || billId}
            </h1>
            <p className="text-muted-foreground">
              Bill details for {supplier?.name || 'supplier'}
            </p>
          </div>
        </div>

        <SupplierBillDetailsDialog
          companyId={companyIdNum}
          supplierId={supplierIdNum}
          billId={billIdNum}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              navigate({
                to: '/companies/$companyId/suppliers/$supplierId/bills',
                params: { companyId, supplierId },
              })
            }
          }}
          highlightedItemId={search.highlightedItemId}
        />
      </div>
    </RoleBasedLayout>
  )
}

