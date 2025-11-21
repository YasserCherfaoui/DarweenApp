import { createRoute, useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft } from 'lucide-react'
import { WarehouseBillDetailsPage } from '@/components/warehousebills/WarehouseBillDetailsPage'
import {
  useWarehouseBill,
  useCompleteExitBill,
  useCancelWarehouseBill,
} from '@/hooks/queries/use-warehouse-bills'
import { rootRoute } from '@/main'

export const CompanyWarehouseBillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/warehouse-bills/$billId',
  component: CompanyWarehouseBillDetailPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      highlightedItemId: search.highlightedItemId
        ? parseInt(String(search.highlightedItemId), 10)
        : undefined,
    }
  },
})

function CompanyWarehouseBillDetailPage() {
  const { companyId, billId } = useParams({
    from: '/companies/$companyId/warehouse-bills/$billId',
  })
  const search = useSearch({ from: '/companies/$companyId/warehouse-bills/$billId' })
  const companyIdNum = parseInt(companyId)
  const billIdNum = parseInt(billId)
  const navigate = useNavigate()

  const { data: bill, isLoading } = useWarehouseBill(companyIdNum, billIdNum)
  const completeBill = useCompleteExitBill()
  const cancelBill = useCancelWarehouseBill()

  const handleComplete = async () => {
    await completeBill.mutateAsync({
      companyId: companyIdNum,
      billId: billIdNum,
    })
    navigate({ to: `/companies/${companyId}/warehouse-bills` })
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this bill?')) {
      await cancelBill.mutateAsync({
        companyId: companyIdNum,
        billId: billIdNum,
      })
      navigate({ to: `/companies/${companyId}/warehouse-bills` })
    }
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <Loading fullScreen={false} />
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: `/companies/${companyId}/warehouse-bills` })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouse Bills
        </Button>

        {bill && (
          <WarehouseBillDetailsPage
            bill={bill}
            companyId={companyIdNum}
            onComplete={handleComplete}
            onCancel={handleCancel}
            isLoading={completeBill.isPending || cancelBill.isPending}
            highlightedItemId={search.highlightedItemId}
          />
        )}
      </div>
    </RoleBasedLayout>
  )
}

