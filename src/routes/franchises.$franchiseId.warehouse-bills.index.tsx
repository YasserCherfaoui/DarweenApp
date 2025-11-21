import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { WarehouseBillTable } from '@/components/warehousebills/WarehouseBillTable'
import { WarehouseBillDetailsDialog } from '@/components/warehousebills/WarehouseBillDetailsDialog'
import { VerifyEntryBillDialog } from '@/components/warehousebills/VerifyEntryBillDialog'
import {
  useFranchiseWarehouseBills,
  useVerifyEntryBill,
  useCompleteEntryBill,
} from '@/hooks/queries/use-warehouse-bills'
import type { WarehouseBill, VerifyEntryBillRequest } from '@/types/api'
import { rootRoute } from '@/main'

export const FranchiseWarehouseBillsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/warehouse-bills',
  component: FranchiseWarehouseBillsPage,
})

function FranchiseWarehouseBillsPage() {
  const { franchiseId } = useParams({
    from: '/franchises/$franchiseId/warehouse-bills',
  })
  const franchiseIdNum = parseInt(franchiseId)
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [selectedBill, setSelectedBill] = useState<WarehouseBill | undefined>()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)

  const { data: billsData, isLoading } = useFranchiseWarehouseBills(
    franchiseIdNum,
    { page, limit }
  )
  const verifyBill = useVerifyEntryBill()
  const completeBill = useCompleteEntryBill()

  const handleViewDetails = (bill: WarehouseBill) => {
    setSelectedBill(bill)
    setDetailsOpen(true)
  }

  const handleVerify = (bill: WarehouseBill) => {
    setSelectedBill(bill)
    setVerifyOpen(true)
  }

  const handleVerifySubmit = async (data: VerifyEntryBillRequest) => {
    if (selectedBill) {
      await verifyBill.mutateAsync({
        franchiseId: franchiseIdNum,
        billId: selectedBill.id,
        data,
      })
      setVerifyOpen(false)
      setDetailsOpen(true)
    }
  }

  const handleComplete = async () => {
    if (selectedBill) {
      await completeBill.mutateAsync({
        franchiseId: franchiseIdNum,
        billId: selectedBill.id,
      })
      setDetailsOpen(false)
    }
  }

  const bills = billsData?.data || []

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: `/franchises/${franchiseId}` })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Franchise
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Warehouse Bills (Entry Bills)
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage inventory receipts from warehouse
              </p>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Entry Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading fullScreen={false} size="md" />
            ) : (
              <>
                <WarehouseBillTable
                  bills={bills}
                  franchiseId={franchiseIdNum}
                  onView={handleViewDetails}
                />
                {billsData && billsData.total_pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {billsData.page} of {billsData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= billsData.total_pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Bill Details Dialog */}
        {selectedBill && (
          <>
            <WarehouseBillDetailsDialog
              open={detailsOpen}
              onOpenChange={setDetailsOpen}
              bill={selectedBill}
              onComplete={handleComplete}
              isLoading={completeBill.isPending}
              isFranchise={true}
            />
            {selectedBill.bill_type === 'entry' &&
              selectedBill.status === 'draft' && (
                <VerifyEntryBillDialog
                  open={verifyOpen}
                  onOpenChange={setVerifyOpen}
                  bill={selectedBill}
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

