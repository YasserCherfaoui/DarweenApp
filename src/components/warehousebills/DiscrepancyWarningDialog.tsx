import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ProductVariant, WarehouseBillItem } from '@/types/api'
import { AlertTriangle, Plus, XCircle } from 'lucide-react'

interface DiscrepancySummary {
  missingCount: number
  mismatchCount: number
  extraCount: number
  missingItems: Array<{ item: WarehouseBillItem; expected: number }>
  mismatchItems: Array<{ item: WarehouseBillItem; expected: number; received: number }>
  extraItems: Array<{ product_variant_id: number; received: number; variant?: ProductVariant }>
}

interface DiscrepancyWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: DiscrepancySummary | null
  onConfirm: () => void
  isLoading?: boolean
}

export function DiscrepancyWarningDialog({
  open,
  onOpenChange,
  summary,
  onConfirm,
  isLoading = false,
}: DiscrepancyWarningDialogProps) {
  if (!summary) return null

  const hasDiscrepancies =
    summary.missingCount > 0 ||
    summary.mismatchCount > 0 ||
    summary.extraCount > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Discrepancies Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            The following discrepancies have been found between the exit bill
            and received items. Please review and confirm before proceeding.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {hasDiscrepancies && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please review the discrepancies below. Inventory will be updated
                according to the received quantities.
              </AlertDescription>
            </Alert>
          )}

          {/* Missing Items */}
          {summary.missingCount > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Missing Items ({summary.missingCount})
              </h4>
              <div className="space-y-2">
                {summary.missingItems.map(({ item, expected }) => (
                  <div
                    key={item.product_variant_id}
                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
                  >
                    <div className="font-medium">
                      {item.variant_name ||
                        item.product_name ||
                        `Variant #${item.product_variant_id}`}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expected: {expected}, Received: 0
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mismatch Items */}
          {summary.mismatchCount > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Quantity Mismatches ({summary.mismatchCount})
              </h4>
              <div className="space-y-2">
                {summary.mismatchItems.map(({ item, expected, received }) => (
                  <div
                    key={item.product_variant_id}
                    className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800"
                  >
                    <div className="font-medium">
                      {item.variant_name ||
                        item.product_name ||
                        `Variant #${item.product_variant_id}`}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Expected: {expected}, Received: {received} (Difference:{' '}
                      {received - expected > 0 ? '+' : ''}
                      {received - expected})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra Items */}
          {summary.extraCount > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4 text-yellow-500" />
                Extra Items ({summary.extraCount})
              </h4>
              <div className="space-y-2">
                {summary.extraItems.map(({ product_variant_id, received, variant }) => (
                  <div
                    key={product_variant_id}
                    className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="font-medium">
                      {variant?.name || `Variant #${product_variant_id}`}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Received: {received} (not in exit bill)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasDiscrepancies && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                No discrepancies found. All items match expected quantities.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={hasDiscrepancies ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {isLoading ? 'Creating...' : 'Confirm & Create Entry Bill'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
