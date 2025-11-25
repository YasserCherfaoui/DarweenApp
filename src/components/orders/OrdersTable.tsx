import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Package, ShoppingCart } from 'lucide-react'
import type { Order } from '@/types/api'

interface OrdersTableProps {
  orders: Order[]
  companyId: number
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

const sourceColors: Record<string, string> = {
  shopify: 'bg-indigo-100 text-indigo-800',
  woocommerce: 'bg-blue-100 text-blue-800',
  manual: 'bg-gray-100 text-gray-800',
}

export function OrdersTable({ orders, companyId }: OrdersTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.external_order_id ? (
                    <div className="flex items-center gap-2">
                      <span>#{order.id}</span>
                      <span className="text-xs text-gray-500">
                        ({order.external_order_id})
                      </span>
                    </div>
                  ) : (
                    `#${order.id}`
                  )}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_full_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={sourceColors[order.source] || sourceColors.manual}>
                    {order.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status] || statusColors.unconfirmed}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(order.total)}
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link to={`/companies/${companyId}/orders/${order.id}`}>
                      <Button variant="ghost" size="icon-sm">
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
    </div>
  )
}

