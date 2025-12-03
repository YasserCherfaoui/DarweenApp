import {
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCircle,
  RotateCcw,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import type { OrderStatus } from '@/types/api'

interface StatusIconProps {
  status: OrderStatus
  className?: string
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const iconProps = {
    className: className || 'h-4 w-4',
  }

  switch (status) {
    case 'unconfirmed':
      return <Clock {...iconProps} />
    case 'packing':
      return <Package {...iconProps} />
    case 'dispatching':
      return <Truck {...iconProps} />
    case 'delivering':
      return <MapPin {...iconProps} />
    case 'delivered':
      return <CheckCircle {...iconProps} />
    case 'returning':
      return <RotateCcw {...iconProps} />
    case 'returned':
      return <XCircle {...iconProps} />
    case 'cancelled':
      return <XCircle {...iconProps} />
    case 'relaunched':
      return <RefreshCw {...iconProps} />
    default:
      return <AlertCircle {...iconProps} />
  }
}



