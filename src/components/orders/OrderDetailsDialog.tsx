import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/api'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  companyId: number
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  companyId,
}: OrderDetailsDialogProps) {
  if (!order) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Order #{order.id}
            {order.external_order_id && (
              <span className="text-sm text-gray-500 ml-2">
                ({order.external_order_id})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <OrderStatusBadge status={order.status} />
              <Badge variant="outline">{order.source}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Customer Details */}
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Full Name:</span>
                <div className="font-medium">{order.customer_full_name}</div>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <div className="font-medium">{order.customer_phone}</div>
              </div>
              {order.customer_phone2 && (
                <div>
                  <span className="text-gray-500">Phone 2:</span>
                  <div className="font-medium">{order.customer_phone2}</div>
                </div>
              )}
              <div>
                <span className="text-gray-500">State:</span>
                <div className="font-medium">{order.customer_state}</div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Address:</span>
                <div className="font-medium">{order.customer_address}</div>
              </div>
              {order.customer_comments && (
                <div className="col-span-2">
                  <span className="text-gray-500">Comments:</span>
                  <div className="font-medium">{order.customer_comments}</div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Details */}
          {order.shipping_provider && (
            <div>
              <h3 className="font-semibold mb-2">Shipping Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Provider:</span>
                  <div className="font-medium">{order.shipping_provider}</div>
                </div>
                <div>
                  <span className="text-gray-500">Delivery Type:</span>
                  <div className="font-medium">{order.delivery_type}</div>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-2">Order Items</h3>
            <div className="border rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-right">Quantity</th>
                    <th className="px-4 py-2 text-right">Price</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2">
                        <div>
                          {item.is_snapshot && (
                            <Badge variant="outline" className="text-xs mr-2">
                              Snapshot
                            </Badge>
                          )}
                          {item.product_variant_id ? (
                            <span>Variant #{item.product_variant_id}</span>
                          ) : (
                            <span>Product from webhook</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {item.confirmed_quantity ?? item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {formatCurrency(item.confirmed_price ?? item.price)}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex justify-between">
                <span>Product Total:</span>
                <span className="font-medium">{formatCurrency(order.product_total)}</span>
              </div>
              {order.first_delivery_cost > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery Fee (from API):</span>
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
          </div>

          {/* Client Statuses */}
          {order.client_statuses && order.client_statuses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Client Status History</h3>
              <div className="space-y-2">
                {order.client_statuses.map((status) => (
                  <div
                    key={status.id}
                    className="border rounded-md p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">
                        {status.qualification_name}
                        {status.sub_qualification_name && (
                          <span className="text-gray-500 ml-1">
                            - {status.sub_qualification_name}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {new Date(status.date_time).toLocaleString()}
                      </span>
                    </div>
                    {status.comment && (
                      <div className="text-gray-600">{status.comment}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

