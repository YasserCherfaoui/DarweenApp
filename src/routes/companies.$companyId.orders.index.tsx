import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { ColumnVisibilityDropdown } from '@/components/orders/ColumnVisibilityDropdown'
import { OrdersTable } from '@/components/orders/OrdersTable'
import { OrderStatusCounters } from '@/components/orders/OrderStatusCounters'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompany } from '@/hooks/queries/use-companies'
import { useOrders } from '@/hooks/queries/use-orders'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { rootRoute } from '@/main'
import type { OrderSource, OrderStatus } from '@/types/api'
import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

export const CompanyOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/orders',
  component: CompanyOrdersPage,
})

function CompanyOrdersPage() {
  const navigate = useNavigate()
  const { companyId } = CompanyOrdersRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const [sourceFilter, setSourceFilter] = useState<OrderSource | undefined>()
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState(1)
  const limit = 20

  const {
    columnVisibility,
    toggleColumn,
    resetToDefaults,
  } = useColumnVisibility()

  const { data: ordersData, isLoading, refetch } = useOrders(Number(companyId), {
    status: statusFilter,
    source: sourceFilter,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    limit,
  })

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Company
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Orders
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage online orders from Shopify, WooCommerce, and manual entries
              </p>
            </div>
            <Link to={`/companies/${companyId}/orders/new` as any}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Counters */}
        <OrderStatusCounters
          companyId={Number(companyId)}
          onStatusClick={(status) => {
            setStatusFilter(status)
            setPage(1) // Reset to first page when filtering
          }}
        />

        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) =>
                  setStatusFilter(value === 'all' ? undefined : (value as OrderStatus))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                  <SelectItem value="packing">Packing</SelectItem>
                  <SelectItem value="dispatching">Dispatching</SelectItem>
                  <SelectItem value="delivering">Delivering</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="returning">Returning</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="relaunched">Relaunched</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select
                value={sourceFilter || 'all'}
                onValueChange={(value) =>
                  setSourceFilter(value === 'all' ? undefined : (value as OrderSource))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="shopify">Shopify</SelectItem>
                  <SelectItem value="woocommerce">WooCommerce</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        ) : ordersData && ordersData.orders && ordersData.orders.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Orders List</h2>
              <ColumnVisibilityDropdown
                columnVisibility={columnVisibility}
                onToggleColumn={toggleColumn}
                onResetToDefaults={resetToDefaults}
              />
            </div>
            <OrdersTable
              orders={ordersData.orders}
              companyId={Number(companyId)}
              columnVisibility={columnVisibility}
              onOrderConfirmed={() => {
                refetch()
              }}
            />
            {/* Pagination */}
            {ordersData.total > limit && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to{' '}
                  {Math.min(page * limit, ordersData.total)} of {ordersData.total}{' '}
                  orders
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(ordersData.total / limit), p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(ordersData.total / limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Orders from Shopify, WooCommerce, or manual entries will appear here.
              </p>
              <Link to={`/companies/${companyId}/orders/new` as any}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Order
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}



