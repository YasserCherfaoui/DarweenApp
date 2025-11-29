import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useOrderStatusCounts } from '@/hooks/queries/use-orders'
import type { OrderStatus } from '@/types/api'
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Clock,
  Box,
  ArrowRight,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

interface StatusCounter {
  status: OrderStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  progressColor: string
}

const statusConfigs: StatusCounter[] = [
  {
    status: 'unconfirmed',
    label: 'Unconfirmed',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    progressColor: 'bg-yellow-600 dark:bg-yellow-500',
  },
  {
    status: 'packing',
    label: 'Packing',
    icon: Box,
    color: 'text-blue-600 dark:text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    progressColor: 'bg-blue-600 dark:bg-blue-500',
  },
  {
    status: 'dispatching',
    label: 'Dispatching',
    icon: ArrowRight,
    color: 'text-purple-600 dark:text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    progressColor: 'bg-purple-600 dark:bg-purple-500',
  },
  {
    status: 'delivering',
    label: 'Delivering',
    icon: Truck,
    color: 'text-indigo-600 dark:text-indigo-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    progressColor: 'bg-indigo-600 dark:bg-indigo-500',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    progressColor: 'bg-green-600 dark:bg-green-500',
  },
  {
    status: 'returning',
    label: 'Returning',
    icon: RotateCcw,
    color: 'text-orange-600 dark:text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950',
    borderColor: 'border-orange-200 dark:border-orange-800',
    progressColor: 'bg-orange-600 dark:bg-orange-500',
  },
  {
    status: 'returned',
    label: 'Returned',
    icon: Package,
    color: 'text-amber-600 dark:text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950',
    borderColor: 'border-amber-200 dark:border-amber-800',
    progressColor: 'bg-amber-600 dark:bg-amber-500',
  },
  {
    status: 'cancelled',
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    progressColor: 'bg-red-600 dark:bg-red-500',
  },
  {
    status: 'relaunched',
    label: 'Relaunched',
    icon: RotateCcw,
    color: 'text-cyan-600 dark:text-cyan-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    progressColor: 'bg-cyan-600 dark:bg-cyan-500',
  },
]

interface OrderStatusCountersProps {
  companyId: number
  onStatusClick?: (status: OrderStatus) => void
}

const STORAGE_KEY = 'orderStatusCardsViewMode'

export function OrderStatusCounters({
  companyId,
  onStatusClick,
}: OrderStatusCountersProps) {
  const { data: counts, isLoading } = useOrderStatusCounts(companyId)
  const [isCompact, setIsCompact] = useState(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'compact'
  })

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isCompact ? 'compact' : 'normal')
  }, [isCompact])

  const statusCards = useMemo(() => {
    return statusConfigs.map((config) => {
      const count = counts?.[config.status] || 0

      return {
        ...config,
        count,
        total: Object.values(counts || {}).reduce((sum, val) => sum + val, 0),
      }
    })
  }, [counts])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Status</h2>
          <div className="w-9 h-9" /> {/* Spacer for toggle button */}
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {statusConfigs.map((config) => (
            <Card key={config.status} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Order Status
        </h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCompact(!isCompact)}
          title={isCompact ? 'Switch to normal view' : 'Switch to compact view'}
        >
          {isCompact ? (
            <Maximize2 className="h-4 w-4" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className={`grid gap-4 ${
          isCompact
            ? 'md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9'
            : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        }`}
      >
        {statusCards.map((card) => {
          const Icon = card.icon
          const percentage =
            card.total > 0 ? Math.round((card.count / card.total) * 100) : 0

          if (isCompact) {
            return (
              <Card
                key={card.status}
                className={`cursor-pointer transition-all hover:shadow-md ${card.bgColor} ${card.borderColor} border-2`}
                onClick={() => onStatusClick?.(card.status)}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`rounded-lg p-2.5 ${card.bgColor} ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="w-full">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {card.label}
                      </p>
                      <p className={`text-xl font-bold ${card.color}`}>
                        {card.count}
                      </p>
                    </div>
                    {card.total > 0 && (
                      <div className="w-full">
                        <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-1 rounded-full ${card.progressColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card
              key={card.status}
              className={`cursor-pointer transition-all hover:shadow-md ${card.bgColor} ${card.borderColor} border-2`}
              onClick={() => onStatusClick?.(card.status)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-3 ${card.bgColor} ${card.color}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                        {card.label}
                      </p>
                      <p className={`text-2xl font-bold ${card.color}`}>
                        {card.count}
                      </p>
                    </div>
                  </div>
                </div>
                {card.total > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-1.5 rounded-full ${card.progressColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {percentage}% of total
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

