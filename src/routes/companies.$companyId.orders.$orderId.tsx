import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { ConfirmOrderDialog } from '@/components/orders/ConfirmOrderDialog'
import { ClientStatusDialog } from '@/components/orders/ClientStatusDialog'
import { useOrder, useUpdateOrderStatus, useCancelOrder, useRelaunchOrder, useAddClientStatus, useQualifications } from '@/hooks/queries/use-orders'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { rootRoute } from '@/main'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrderStatus } from '@/types/api'

export const CompanyOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/orders/$orderId',
  component: CompanyOrderPage,
})

function CompanyOrderPage() {
  const navigate = useNavigate()
  const { companyId, orderId } = CompanyOrderRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const { data: order, isLoading } = useOrder(Number(companyId), Number(orderId))
  const updateStatus = useUpdateOrderStatus(Number(companyId), Number(orderId))
  const cancelOrder = useCancelOrder(Number(companyId), Number(orderId))
  const relaunchOrder = useRelaunchOrder(Number(companyId), Number(orderId))
  const addClientStatus = useAddClientStatus(Number(companyId), Number(orderId))
  const { data: qualifications = [] } = useQualifications(Number(companyId))
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [clientStatusDialogOpen, setClientStatusDialogOpen] = useState(false)

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    updateStatus.mutate({ status: newStatus })
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrder.mutate()
    }
  }

  const handleRelaunch = () => {
    if (confirm('Are you sure you want to relaunch this order?')) {
      relaunchOrder.mutate()
    }
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <Card className="p-6">
          <Skeleton className="h-64 w-full" />
        </Card>
      </RoleBasedLayout>
    )
  }

  if (!order) {
    return (
      <RoleBasedLayout>
        <Card className="p-6">
          <div className="text-center">Order not found</div>
        </Card>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/orders` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
                {order.external_order_id && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({order.external_order_id})
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 capitalize">{order.source}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {(order.status === 'unconfirmed' || order.status === 'relaunched') && (
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Order
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setClientStatusDialogOpen(true)}
              >
                Add Client Status
              </Button>
              {order.status !== 'cancelled' && (
                <Button variant="destructive" onClick={handleCancel}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
              {order.status !== 'unconfirmed' && order.status !== 'relaunched' && (
                <Button variant="outline" onClick={handleRelaunch}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Relaunch
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Full Name</div>
                  <div className="font-medium">{order.customer_full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium">{order.customer_phone}</div>
                </div>
                {order.customer_phone2 && (
                  <div>
                    <div className="text-sm text-gray-500">Phone 2</div>
                    <div className="font-medium">{order.customer_phone2}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">State</div>
                  <div className="font-medium">{order.customer_state}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="font-medium">{order.customer_address}</div>
                </div>
                {order.customer_comments && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500">Comments</div>
                    <div className="font-medium">{order.customer_comments}</div>
                  </div>
                )}
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.is_snapshot && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Snapshot
                          </span>
                        )}
                        <div>
                          <div className="font-medium">
                            {item.product_name || 'Product'}
                            {item.variant_name && (
                              <span className="text-gray-600 ml-1">
                                - {item.variant_name}
                              </span>
                            )}
                          </div>
                          {item.sku && (
                            <div className="text-xs text-gray-500 mt-1">
                              SKU: {item.sku}
                            </div>
                          )}
                          {item.product_variant_id && !item.product_name && (
                            <div className="text-xs text-gray-500 mt-1">
                              Variant ID: {item.product_variant_id}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Qty: {item.confirmed_quantity ?? item.quantity} ×{' '}
                        {formatCurrency(item.confirmed_price ?? item.price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.line_total)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Summary & Actions */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Product Total:</span>
                  <span className="font-medium">
                    {formatCurrency(order.product_total)}
                  </span>
                </div>
                {order.first_delivery_cost > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery Fee (API):</span>
                    <span>{formatCurrency(order.first_delivery_cost)}</span>
                  </div>
                )}
                {order.second_delivery_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-medium">
                      {formatCurrency(order.second_delivery_cost)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Card>

            {/* Status Update */}
            {order.status !== 'cancelled' && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                <Select
                  value={order.status}
                  onValueChange={(value) =>
                    handleStatusChange(value as OrderStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                    <SelectItem value="packing">Packing</SelectItem>
                    <SelectItem value="dispatching">Dispatching</SelectItem>
                    <SelectItem value="delivering">Delivering</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returning">Returning</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            )}

            {/* Shipping Details */}
            {order.shipping_provider && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Provider:</span>{' '}
                    <span className="font-medium">{order.shipping_provider}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Delivery Type:</span>{' '}
                    <span className="font-medium capitalize">
                      {order.delivery_type}
                    </span>
                  </div>
                  {order.commune_id && (
                    <div>
                      <span className="text-gray-500">Commune ID:</span>{' '}
                      <span className="font-medium">{order.commune_id}</span>
                    </div>
                  )}
                  {order.center_id && (
                    <div>
                      <span className="text-gray-500">Center ID:</span>{' '}
                      <span className="font-medium">{order.center_id}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Dialogs */}
        {order && (
          <>
            <ConfirmOrderDialog
              open={confirmDialogOpen}
              onOpenChange={setConfirmDialogOpen}
              order={order}
              companyId={Number(companyId)}
              onSuccess={() => {
                // Order will be refetched automatically
              }}
            />
            <ClientStatusDialog
              open={clientStatusDialogOpen}
              onOpenChange={setClientStatusDialogOpen}
              qualifications={qualifications}
              onSubmit={(data) => {
                addClientStatus.mutate(data)
              }}
              isLoading={addClientStatus.isPending}
            />
          </>
        )}
      </div>
    </RoleBasedLayout>
  )
}

