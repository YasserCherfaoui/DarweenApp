import { useState } from 'react'
import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ExitBillForm } from '@/components/warehousebills/ExitBillForm'
import { useCreateExitBill } from '@/hooks/queries/use-warehouse-bills'
import { ErrorDialog } from '@/components/ui/error-dialog'
import { rootRoute } from '@/main'

export const CompanyWarehouseBillsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/warehouse-bills/new',
  component: CompanyWarehouseBillsNewPage,
})

function CompanyWarehouseBillsNewPage() {
  const { companyId } = useParams({ from: '/companies/$companyId/warehouse-bills/new' })
  const companyIdNum = parseInt(companyId)
  const navigate = useNavigate()
  const createBill = useCreateExitBill()
  const [errorDialog, setErrorDialog] = useState<{ 
    open: boolean
    message: string
    issues?: Array<{
      item_index?: number
      variant_id?: number
      variant_sku?: string
      product_sku?: string
      product_name?: string
      message: string
      available_qty?: number
      required_qty?: number
    }>
  }>({
    open: false,
    message: '',
  })

  const handleSubmit = async (data: any) => {
    try {
      await createBill.mutateAsync({
        companyId: companyIdNum,
        data,
      })
      navigate({ to: `/companies/${companyId}/warehouse-bills` })
    } catch (error: any) {
      // Try to extract issues from error response
      let errorMessage = 'Failed to create exit bill'
      let issues: any[] | undefined = undefined

      if (error?.response?.data?.error) {
        const errorData = error.response.data.error
        errorMessage = errorData.message || errorMessage
        if (errorData.issues && Array.isArray(errorData.issues)) {
          issues = errorData.issues
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setErrorDialog({
        open: true,
        message: errorMessage,
        issues,
      })
    }
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

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Exit Bill
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create a new exit bill to transfer inventory from warehouse to franchise
          </p>
        </div>

        <ExitBillForm
          companyId={companyIdNum}
          onSubmit={handleSubmit}
          isLoading={createBill.isPending}
        />

        <ErrorDialog
          open={errorDialog.open}
          onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
          title="Failed to Create Exit Bill"
          message={errorDialog.message}
          issues={errorDialog.issues}
          companyId={companyIdNum}
          onAdjusted={() => {
            // Optionally refresh or allow retry after adjustment
            // For now, just close the error dialog so user can retry
            setErrorDialog({ ...errorDialog, open: false })
          }}
        />
      </div>
    </RoleBasedLayout>
  )
}

