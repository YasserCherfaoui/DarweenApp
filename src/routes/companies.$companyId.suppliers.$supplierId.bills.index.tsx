import { createRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowLeft, DollarSign } from 'lucide-react'
import { SupplierBillTable } from '@/components/suppliers/SupplierBillTable'
import { SupplierBillDetailsDialog } from '@/components/suppliers/SupplierBillDetailsDialog'
import { SupplierOutstandingBalanceCard } from '@/components/suppliers/SupplierOutstandingBalanceCard'
import { SupplierPaymentDialog } from '@/components/suppliers/SupplierPaymentDialog'
import { useSupplierBills, useDeleteSupplierBill, useRecordSupplierPayment } from '@/hooks/queries/use-supplier-bills'
import { useSupplierOutstandingBalance } from '@/hooks/queries/use-supplier-bills'
import { useSupplier } from '@/hooks/queries/use-suppliers'
import type { SupplierBill } from '@/types/api'
import { rootRoute } from '@/main'

export const SupplierBillsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId/bills',
  component: SupplierBillsPage,
})

function SupplierBillsPage() {
  const { companyId, supplierId } = useParams({ from: '/companies/$companyId/suppliers/$supplierId/bills' })
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)
  const navigate = useNavigate()
  
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [selectedBill, setSelectedBill] = useState<SupplierBill | undefined>()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)

  const { data: supplier } = useSupplier(companyIdNum, supplierIdNum)
  const { data: billsData, isLoading } = useSupplierBills(companyIdNum, supplierIdNum, { page, limit })
  const { data: outstandingBalance } = useSupplierOutstandingBalance(companyIdNum, supplierIdNum)
  const deleteBill = useDeleteSupplierBill()
  const recordPayment = useRecordSupplierPayment()

  const handleViewDetails = (bill: SupplierBill) => {
    setSelectedBill(bill)
    setDetailsOpen(true)
  }

  const handleDelete = async (billId: number) => {
    if (confirm('Are you sure you want to delete this bill? This will restore inventory.')) {
      await deleteBill.mutateAsync({
        companyId: companyIdNum,
        supplierId: supplierIdNum,
        billId,
      })
    }
  }

  const handleRecordPayment = (data: any) => {
    recordPayment.mutate(
      {
        companyId: companyIdNum,
        supplierId: supplierIdNum,
        data,
      },
      {
        onSuccess: () => {
          setPaymentDialogOpen(false)
        },
      }
    )
  }

  const bills = billsData?.data || []

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: `/companies/${companyId}/suppliers/${supplierId}` })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Supplier
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Supplier Bills - {supplier?.name || 'Supplier'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage bills and payments for this supplier
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPaymentDialogOpen(true)} variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
            <Link to={`/companies/${companyId}/suppliers/${supplierId}/bills/new` as any}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Bill
              </Button>
            </Link>
          </div>
        </div>

        {/* Outstanding Balance */}
        <SupplierOutstandingBalanceCard
          companyId={companyIdNum}
          supplierId={supplierIdNum}
        />

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading fullScreen={false} size="md" />
            ) : (
              <>
                <SupplierBillTable
                  bills={bills}
                  companyId={companyIdNum}
                  supplierId={supplierIdNum}
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
          <SupplierBillDetailsDialog
            companyId={companyIdNum}
            supplierId={supplierIdNum}
            billId={selectedBill.id}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            onDelete={handleDelete}
          />
        )}

        {/* Payment Dialog */}
        <SupplierPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onSubmit={handleRecordPayment}
          isLoading={recordPayment.isPending}
          supplierId={supplierIdNum}
          outstandingAmount={outstandingBalance?.outstanding_amount}
        />
      </div>
    </RoleBasedLayout>
  )
}

