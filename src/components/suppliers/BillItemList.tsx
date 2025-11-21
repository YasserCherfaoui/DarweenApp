import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import type { SupplierBillItem } from '@/types/api'

interface BillItemListProps {
  items: SupplierBillItem[]
  canEdit?: boolean
  onEdit?: (item: SupplierBillItem) => void
  onRemove?: (itemId: number) => void
  highlightedItemId?: number
}

export function BillItemList({
  items,
  canEdit = false,
  onEdit,
  onRemove,
  highlightedItemId,
}: BillItemListProps) {
  const highlightedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (highlightedItemId && highlightedRef.current) {
      // Scroll to highlighted item after a brief delay to ensure DOM is ready
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)
    }
  }, [highlightedItemId])

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No items in this bill
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isHighlighted = highlightedItemId === item.id

        return (
          <div
            key={item.id}
            ref={isHighlighted ? highlightedRef : null}
            className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
              isHighlighted
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg ring-2 ring-yellow-400 dark:ring-yellow-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-900'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium">
                {item.product_name && item.variant_name ? (
                  <>
                    {item.product_name} - {item.variant_name}
                    {item.variant_sku && (
                      <span className="text-sm text-gray-500 ml-2">
                        (SKU: {item.variant_sku})
                      </span>
                    )}
                  </>
                ) : (
                  <>Product Variant #{item.product_variant_id}</>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Quantity: {item.quantity} × ${item.unit_cost.toFixed(2)} = $
                {item.total_cost.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canEdit && onRemove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

