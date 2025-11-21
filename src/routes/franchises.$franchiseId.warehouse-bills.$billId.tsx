import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { WarehouseBillDetailsDialog } from '@/components/warehousebills/WarehouseBillDetailsDialog'
import { VerifyEntryBillDialog } from '@/components/warehousebills/VerifyEntryBillDialog'
import {
  useFranchiseWarehouseBill,
  useVerifyEntryBill,
  useCompleteEntryBill,
} from '@/hooks/queries/use-warehouse-bills'
import type { VerifyEntryBillRequest } from '@/types/api'
import { rootRoute } from '@/main'

export const FranchiseWarehouseBillDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/warehouse-bills/$billId',
  component: FranchiseWarehouseBillDetailPage,
})

function FranchiseWarehouseBillDetailPage() {
  const { franchiseId, billId } = useParams({
    from: '/franchises/$franchiseId/warehouse-bills/$billId',
  })
  const franchiseIdNum = parseInt(franchiseId)
  const billIdNum = parseInt(billId)
  const navigate = useNavigate()

  const [verifyOpen, setVerifyOpen] = useState(false)

  const { data: bill, isLoading } = useFranchiseWarehouseBill(
    franchiseIdNum,
    billIdNum
  )
  const verifyBill = useVerifyEntryBill()
  const completeBill = useCompleteEntryBill()

  const handleVerifySubmit = async (data: VerifyEntryBillRequest) => {
    await verifyBill.mutateAsync({
      franchiseId: franchiseIdNum,
      billId: billIdNum,
      data,
    })
    setVerifyOpen(false)
  }

  const handleComplete = async () => {
    await completeBill.mutateAsync({
      franchiseId: franchiseIdNum,
      billId: billIdNum,
    })
    navigate({ to: `/franchises/${franchiseId}/warehouse-bills` })
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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/franchises/${franchiseId}/warehouse-bills` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Warehouse Bills
          </Button>
          {bill &&
            bill.bill_type === 'entry' &&
            bill.status === 'draft' && (
              <Button onClick={() => setVerifyOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Bill
              </Button>
            )}
        </div>

        {bill && (
          <>
            <WarehouseBillDetailsDialog
              open={true}
              onOpenChange={(open) => {
                if (!open) {
                  navigate({ to: `/franchises/${franchiseId}/warehouse-bills` })
                }
              }}
              bill={bill}
              onComplete={handleComplete}
              isLoading={completeBill.isPending}
              isFranchise={true}
            />
            {bill.bill_type === 'entry' && bill.status === 'draft' && (
              <VerifyEntryBillDialog
                open={verifyOpen}
                onOpenChange={setVerifyOpen}
                bill={bill}
                onSubmit={handleVerifySubmit}
                isLoading={verifyBill.isPending}
              />
            )}
          </>
        )}
      </div>
    </RoleBasedLayout>
  )
}

