import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertCircle } from 'lucide-react'
import { VariantStockAdjustmentDialog } from '@/components/warehousebills/VariantStockAdjustmentDialog'

interface ValidationIssue {
  item_index?: number
  variant_id?: number
  variant_sku?: string
  product_sku?: string
  product_name?: string
  message: string
  available_qty?: number
  required_qty?: number
}

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  message: string
  issues?: ValidationIssue[]
  companyId?: number
  onAdjusted?: () => void
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = 'Error',
  message,
  issues,
  companyId,
  onAdjusted,
}: ErrorDialogProps) {
  const [adjustmentDialog, setAdjustmentDialog] = useState<{
    open: boolean
    variantId: number
    variantSku?: string
  }>({
    open: false,
    variantId: 0,
  })

  const handleAdjustClick = (variantId: number, variantSku?: string) => {
    setAdjustmentDialog({
      open: true,
      variantId,
      variantSku,
    })
  }

  const handleAdjusted = () => {
    setAdjustmentDialog({ open: false, variantId: 0 })
    onAdjusted?.()
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/SVG/Darween.svg" 
                alt="Darween Logo" 
                className="h-12 w-12 opacity-50 dark:invert"
              />
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDialogTitle className="text-destructive">{title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-2">
              {issues && issues.length > 0 ? (
                <div className="space-y-4">
                  <p>{message}</p>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Actual Quantity</TableHead>
                          <TableHead>Missing Quantity</TableHead>
                          {companyId && <TableHead className="text-right">Action</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {issues.map((issue, index) => {
                          const sku = issue.variant_sku || issue.product_sku || `Item #${(issue.item_index ?? index) + 1}`
                          const actualQty = issue.available_qty ?? 0
                          const requiredQty = issue.required_qty ?? 0
                          const missingQty = Math.max(0, requiredQty - actualQty)
                          
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{sku}</TableCell>
                              <TableCell>{actualQty}</TableCell>
                              <TableCell className="text-destructive font-semibold">{missingQty}</TableCell>
                              {companyId && issue.variant_id && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAdjustClick(issue.variant_id!, issue.variant_sku)}
                                  >
                                    Adjust Quantity
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <span className="whitespace-pre-wrap">{message}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="destructive"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {companyId && (
        <VariantStockAdjustmentDialog
          variantId={adjustmentDialog.variantId}
          companyId={companyId}
          variantSku={adjustmentDialog.variantSku}
          open={adjustmentDialog.open}
          onOpenChange={(open) => setAdjustmentDialog({ ...adjustmentDialog, open })}
          onAdjusted={handleAdjusted}
        />
      )}
    </>
  )
}

