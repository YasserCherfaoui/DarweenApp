import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ColumnVisibility } from '@/hooks/use-column-visibility'
import type { Order } from '@/types/api'
import { Link } from '@tanstack/react-router'
import { CheckCircle, Eye } from 'lucide-react'
import { useState } from 'react'
import { ConfirmOrderDialog } from './ConfirmOrderDialog'
import { SourceIcon } from './SourceIcon'
import { StatusIcon } from './StatusIcon'

interface OrdersTableProps {
  orders: Order[]
  companyId: number
  columnVisibility: ColumnVisibility
  onOrderConfirmed?: () => void
}

const statusColors: Record<string, string> = {
  unconfirmed: 'bg-gray-100 text-gray-800',
  packing: 'bg-blue-100 text-blue-800',
  dispatching: 'bg-yellow-100 text-yellow-800',
  delivering: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  returning: 'bg-red-100 text-red-800',
  returned: 'bg-red-200 text-red-900',
  cancelled: 'bg-gray-200 text-gray-900',
  relaunched: 'bg-purple-100 text-purple-800',
}

const statusIconColors: Record<string, string> = {
  unconfirmed: 'text-gray-600',
  packing: 'text-blue-600',
  dispatching: 'text-yellow-600',
  delivering: 'text-orange-600',
  delivered: 'text-green-600',
  returning: 'text-red-600',
  returned: 'text-red-700',
  cancelled: 'text-gray-700',
  relaunched: 'text-purple-600',
}

const sourceColors: Record<string, string> = {
  shopify: 'text-[#95BF46]',
  woocommerce: 'text-[#96588A]',
  manual: 'text-gray-600',
}

export function OrdersTable({
  orders,
  companyId,
  columnVisibility,
  onOrderConfirmed,
}: OrdersTableProps) {
  const [openAccordions, setOpenAccordions] = useState<Set<number>>(new Set())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedOrderForConfirm, setSelectedOrderForConfirm] = useState<Order | null>(null)

  const toggleAccordion = (orderId: number) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) {
        next.delete(orderId)
      } else {
        next.add(orderId)
      }
      return next
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate visible column count for colspan
  const visibleColumnCount =
    Object.values(columnVisibility).filter(Boolean).length + 1 // +1 for Actions column

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columnVisibility.orderId && <TableHead>Order ID</TableHead>}
            {columnVisibility.externalOrderId && (
              <TableHead>External Order ID</TableHead>
            )}
            {columnVisibility.customer && <TableHead>Customer</TableHead>}
            {columnVisibility.customerPhone && (
              <TableHead>Customer Phone</TableHead>
            )}
            {columnVisibility.customerAddress && (
              <TableHead>Customer Address</TableHead>
            )}
            {columnVisibility.customerState && (
              <TableHead>Customer State</TableHead>
            )}
            {columnVisibility.source && <TableHead>Source</TableHead>}
            {columnVisibility.status && <TableHead>Status</TableHead>}
            {columnVisibility.productTotal && (
              <TableHead>Product Total</TableHead>
            )}
            {columnVisibility.deliveryCost && (
              <TableHead>Delivery Cost</TableHead>
            )}
            {columnVisibility.discount && <TableHead>Discount</TableHead>}
            {columnVisibility.total && <TableHead>Total</TableHead>}
            {columnVisibility.shippingProvider && (
              <TableHead>Shipping Provider</TableHead>
            )}
            {columnVisibility.deliveryType && (
              <TableHead>Delivery Type</TableHead>
            )}
            {columnVisibility.date && <TableHead>Date</TableHead>}
            {columnVisibility.customerComments && (
              <TableHead>Comments</TableHead>
            )}
            {columnVisibility.orderItems && <TableHead>Order Items</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumnCount}
                className="text-center py-8 text-gray-500"
              >
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                {columnVisibility.orderId && (
                  <TableCell className="font-medium">
                    <Link
                      to={`/companies/${companyId}/orders/${order.id}` as any}
                      className="hover:underline cursor-pointer"
                    >
                      #{order.id}
                    </Link>
                  </TableCell>
                )}
                {columnVisibility.externalOrderId && (
                  <TableCell>
                    {order.external_order_id ? (
                      <span className="text-sm text-gray-500">
                        {order.external_order_id}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                )}
                {columnVisibility.customer && (
                  <TableCell>
                    <Link
                      to={`/companies/${companyId}/orders/${order.id}` as any}
                      className="hover:underline cursor-pointer block"
                    >
                      <div className="font-medium">{order.customer_full_name}</div>
                      {!columnVisibility.customerPhone && (
                        <div className="text-sm text-gray-500">
                          {order.customer_phone}
                        </div>
                      )}
                    </Link>
                  </TableCell>
                )}
                {columnVisibility.customerPhone && (
                  <TableCell>
                    <div className="text-sm">{order.customer_phone}</div>
                    {order.customer_phone2 && (
                      <div className="text-xs text-gray-500">
                        {order.customer_phone2}
                      </div>
                    )}
                  </TableCell>
                )}
                {columnVisibility.customerAddress && (
                  <TableCell>
                    <div className="text-sm max-w-xs truncate">
                      {order.customer_address || '—'}
                    </div>
                  </TableCell>
                )}
                {columnVisibility.customerState && (
                  <TableCell>
                    <div className="text-sm">{order.customer_state || '—'}</div>
                  </TableCell>
                )}
                {columnVisibility.source && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <SourceIcon
                        source={order.source}
                        className="h-4 w-4 shrink-0"
                      />
                      <span
                        className={`font-medium capitalize ${
                          sourceColors[order.source] || sourceColors.manual
                        }`}
                      >
                        {order.source}
                      </span>
                    </div>
                  </TableCell>
                )}
                {columnVisibility.status && (
                  <TableCell>
                    <Badge
                      className={
                        statusColors[order.status] || statusColors.unconfirmed
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <StatusIcon
                          status={order.status}
                          className={`h-3 w-3 ${
                            statusIconColors[order.status] ||
                            statusIconColors.unconfirmed
                          }`}
                        />
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                )}
                {columnVisibility.productTotal && (
                  <TableCell className="font-medium">
                    {formatCurrency(order.product_total)}
                  </TableCell>
                )}
                {columnVisibility.deliveryCost && (
                  <TableCell>
                    <div className="text-sm">
                      {formatCurrency(order.first_delivery_cost)}
                      {order.second_delivery_cost > 0 && (
                        <div className="text-xs text-gray-500">
                          + {formatCurrency(order.second_delivery_cost)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                )}
                {columnVisibility.discount && (
                  <TableCell>
                    {order.discount > 0 ? (
                      <span className="text-sm text-red-600">
                        -{formatCurrency(order.discount)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                )}
                {columnVisibility.total && (
                  <TableCell className="font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                )}
                {columnVisibility.shippingProvider && (
                  <TableCell>
                    <div className="text-sm">
                      {order.shipping_provider || '—'}
                    </div>
                  </TableCell>
                )}
                {columnVisibility.deliveryType && (
                  <TableCell>
                    <div className="text-sm capitalize">
                      {order.delivery_type
                        ? order.delivery_type.replace('_', ' ')
                        : '—'}
                    </div>
                  </TableCell>
                )}
                {columnVisibility.date && (
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                )}
                {columnVisibility.customerComments && (
                  <TableCell>
                    <div className="text-sm max-w-xs truncate text-gray-600">
                      {order.customer_comments || '—'}
                    </div>
                  </TableCell>
                )}
                {columnVisibility.orderItems && (
                  <TableCell 
                    className="max-w-xs" 
                    style={{ 
                      width: '256px', 
                      maxWidth: '256px',
                      overflow: 'visible',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  >
                    {order.items && order.items.length > 0 ? (
                      <Accordion>
                        <AccordionItem className="border-none">
                          <AccordionTrigger
                            onClick={() => toggleAccordion(order.id)}
                            isOpen={openAccordions.has(order.id)}
                            className="py-1 text-xs font-normal hover:no-underline"
                          >
                            <span style={{ wordBreak: 'break-word' }}>
                              ({order.items.length}) order item
                              {order.items.length !== 1 ? 's' : ''}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent isOpen={openAccordions.has(order.id)}>
                            <div 
                              className="mt-2" 
                              style={{ 
                                width: '100%', 
                                maxWidth: '100%',
                                overflow: 'visible',
                                wordWrap: 'break-word'
                              }}
                            >
                              <ul 
                                className="list-disc list-outside space-y-1 text-sm pl-5" 
                                style={{ 
                                  width: '100%',
                                  margin: 0,
                                  paddingLeft: '1.25rem'
                                }}
                              >
                                {order.items.map((item) => {
                                  const productName =
                                    item.product_name || 'Unknown Product'
                                  const variantName = item.variant_name
                                    ? ` - ${item.variant_name}`
                                    : ''
                                  const quantity = item.quantity
                                  const sku = item.sku ? ` (${item.sku})` : ''
                                  const price = formatCurrency(item.price)
                                  return (
                                    <li
                                      key={item.id}
                                      className="text-gray-900 dark:text-gray-100"
                                      style={{ 
                                        wordBreak: 'break-all', 
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        width: '100%',
                                        maxWidth: '100%',
                                        overflow: 'visible'
                                      }}
                                    >
                                      {productName}
                                      {variantName} x {quantity}
                                      {sku} ({price})
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setSelectedOrderForConfirm(order)
                        setConfirmDialogOpen(true)
                      }}
                      title="Confirm Order"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Link to={`/companies/${companyId}/orders/${order.id}` as any}>
                      <Button variant="ghost" size="icon-sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {selectedOrderForConfirm && (
        <ConfirmOrderDialog
          open={confirmDialogOpen}
          onOpenChange={(open) => {
            setConfirmDialogOpen(open)
            if (!open) {
              setSelectedOrderForConfirm(null)
            }
          }}
          order={selectedOrderForConfirm}
          companyId={companyId}
          onSuccess={() => {
            onOrderConfirmed?.()
          }}
        />
      )}
    </div>
  )
}



