import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { WarehouseBillTable } from '@/components/warehousebills/WarehouseBillTable'
import {
  useFranchiseWarehouseBills,
} from '@/hooks/queries/use-warehouse-bills'
import { rootRoute } from '@/main'
import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

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

  const { data: billsData, isLoading } = useFranchiseWarehouseBills(
    franchiseIdNum,
    { page, limit }
  )

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
      </div>
    </RoleBasedLayout>
  )
}

