import { createRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '@/components/ui/loading'
import { Plus, ArrowLeft } from 'lucide-react'
import { WarehouseBillTable } from '@/components/warehousebills/WarehouseBillTable'
import {
  WarehouseBillFilters,
  type FilterState,
} from '@/components/warehousebills/WarehouseBillFilters'
import {
  useWarehouseBills,
} from '@/hooks/queries/use-warehouse-bills'
import { rootRoute } from '@/main'

export const CompanyWarehouseBillsIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/warehouse-bills',
  component: CompanyWarehouseBillsPage,
})

function CompanyWarehouseBillsPage() {
  const { companyId } = useParams({ from: '/companies/$companyId/warehouse-bills' })
  const companyIdNum = parseInt(companyId)
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [filters, setFilters] = useState<FilterState>({})

  const { data: billsData, isLoading } = useWarehouseBills(companyIdNum, {
    page,
    limit,
    ...filters,
  })

  const bills = billsData?.data || []

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: `/companies/${companyId}` })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Company
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Warehouse Bills (Exit Bills)
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage inventory transfers from warehouse to franchises
              </p>
            </div>
          </div>
          <Link to="/companies/$companyId/warehouse-bills/new" params={{ companyId }}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Exit Bill
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <WarehouseBillFilters
          companyId={companyIdNum}
          filters={filters}
          onFiltersChange={setFilters}
          onClear={() => {
            setFilters({})
            setPage(1)
          }}
        />

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exit Bills</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loading fullScreen={false} size="md" />
            ) : (
              <>
                <WarehouseBillTable
                  bills={bills}
                  companyId={companyIdNum}
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

