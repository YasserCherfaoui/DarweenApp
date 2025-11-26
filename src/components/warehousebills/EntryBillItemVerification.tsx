import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from 'lucide-react'
import type { WarehouseBillItem, ProductVariant } from '@/types/api'

interface EntryBillItemVerificationProps {
  exitBillItems: WarehouseBillItem[]
  receivedItems: Map<number, number>
  extraItems: Array<{ product_variant_id: number; variant?: ProductVariant }>
  onReceivedQuantityChange: (variantId: number, quantity: number) => void
  onMarkMissing: (variantId: number) => void
  onRemoveExtraItem: (variantId: number) => void
  isLoading?: boolean
}

export function EntryBillItemVerification({
  exitBillItems,
  receivedItems,
  extraItems,
  onReceivedQuantityChange,
  onMarkMissing,
  onRemoveExtraItem,
  isLoading = false,
}: EntryBillItemVerificationProps) {
  const getDiscrepancyInfo = (
    variantId: number,
    expectedQty: number
  ): { type: 'none' | 'missing' | 'mismatch'; message: string } => {
    const received = receivedItems.get(variantId) || 0
    const expected = expectedQty

    if (received === 0 && expected > 0) {
      return { type: 'missing', message: 'Missing item' }
    }
    if (received !== expected && received > 0 && expected > 0) {
      return {
        type: 'mismatch',
        message: `Expected ${expected}, received ${received}`,
      }
    }
    return { type: 'none', message: 'OK' }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-6 gap-4 font-semibold text-sm border-b pb-2">
        <div>Product</div>
        <div className="text-right">Expected</div>
        <div className="text-right">Received</div>
        <div className="text-center">Status</div>
        <div className="text-right">Difference</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Exit Bill Items */}
      {exitBillItems.map((item) => {
        const received = receivedItems.get(item.product_variant_id) || 0
        const expected = item.quantity
        const difference = received - expected
        const discrepancy = getDiscrepancyInfo(item.product_variant_id, expected)

        return (
          <div
            key={item.product_variant_id}
            className="grid grid-cols-6 gap-4 items-center p-3 border rounded-lg"
          >
            <div>
              <div className="font-medium">
                {item.product_name && item.variant_name
                  ? `${item.product_name} - ${item.variant_name}`
                  : item.variant_name ||
                    item.product_name ||
                    `Variant #${item.product_variant_id}`}
              </div>
              {item.variant_sku && (
                <div className="text-sm font-bold">
                  {item.variant_sku}
                </div>
              )}
            </div>
            <div className="text-right font-medium">{expected}</div>
            <div className="text-right">
              <Input
                type="number"
                min="0"
                value={received}
                onChange={(e) =>
                  onReceivedQuantityChange(
                    item.product_variant_id,
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-24 ml-auto"
                disabled={isLoading}
              />
            </div>
            <div className="text-center">
              {discrepancy.type === 'none' ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  OK
                </Badge>
              ) : discrepancy.type === 'missing' ? (
                <Badge className="bg-red-500">
                  <XCircle className="h-3 w-3 mr-1" />
                  Missing
                </Badge>
              ) : (
                <Badge className="bg-orange-500">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mismatch
                </Badge>
              )}
            </div>
            <div
              className={`text-right font-semibold ${
                difference > 0
                  ? 'text-green-600'
                  : difference < 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {difference > 0 ? '+' : ''}
              {difference}
            </div>
            <div className="text-center">
              {received === 0 && expected > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkMissing(item.product_variant_id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onReceivedQuantityChange(item.product_variant_id, 0)
                  }
                  disabled={isLoading}
                  className="text-gray-400 hover:text-red-600"
                  title="Mark as missing"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )
      })}

      {/* Extra Items */}
      {extraItems.length > 0 && (
        <>
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              Extra Items (Not in Exit Bill)
            </h4>
            {extraItems.map((extraItem) => {
              const received = receivedItems.get(extraItem.product_variant_id) || 0
              return (
                <div
                  key={extraItem.product_variant_id}
                  className="grid grid-cols-6 gap-4 items-center p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <div>
                    <div className="font-medium">
                      {extraItem.variant?.name ||
                        `Variant #${extraItem.product_variant_id}`}
                    </div>
                    {extraItem.variant?.sku && (
                      <div className="text-sm text-gray-500">
                        SKU: {extraItem.variant.sku}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-gray-400">-</div>
                  <div className="text-right">
                    <Input
                      type="number"
                      min="0"
                      value={received}
                      onChange={(e) =>
                        onReceivedQuantityChange(
                          extraItem.product_variant_id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-24 ml-auto"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="text-center">
                    <Badge className="bg-yellow-500">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Extra
                    </Badge>
                  </div>
                  <div className="text-right font-semibold text-green-600">
                    +{received}
                  </div>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onRemoveExtraItem(extraItem.product_variant_id)
                      }
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700"
                      title="Remove extra item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
