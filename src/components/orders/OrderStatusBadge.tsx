import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types/api'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

const statusColors: Record<OrderStatus, string> = {
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

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge className={statusColors[status] || statusColors.unconfirmed}>
      {status}
    </Badge>
  )
}



