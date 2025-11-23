import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAdjustInventoryStock } from '@/hooks/queries/use-inventory'
import type { Inventory } from '@/types/api'
import { Plus, Minus } from 'lucide-react'

interface StockAdjustmentDialogProps {
  inventory: Inventory | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockAdjustmentDialog({
  inventory,
  open,
  onOpenChange,
}: StockAdjustmentDialogProps) {
  const [adjustment, setAdjustment] = useState<string>('')
  const [notes, setNotes] = useState('')
  const adjustStock = useAdjustInventoryStock(inventory?.id || 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inventory) return

    const adjustmentValue = parseInt(adjustment, 10)
    if (isNaN(adjustmentValue) || adjustmentValue === 0) {
      return
    }

    try {
      await adjustStock.mutateAsync({
        adjustment: adjustmentValue,
        notes: notes || undefined,
      })
      handleClose()
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleClose = () => {
    setAdjustment('')
    setNotes('')
    onOpenChange(false)
  }

  const adjustmentNumber = parseInt(adjustment, 10)
  const isValidAdjustment = !isNaN(adjustmentNumber) && adjustmentNumber !== 0
  const newStock = inventory ? inventory.stock + (adjustmentNumber || 0) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust the inventory stock for {inventory?.variant_name || 'this variant'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Stock Information</Label>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
                  <p className="text-lg font-semibold">{inventory?.stock || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reserved</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {inventory?.reserved_stock || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                  <p className="text-lg font-semibold text-green-600">
                    {inventory?.available_stock || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment">
                Adjustment Amount
                <span className="text-sm text-gray-500 ml-2">
                  (positive to add, negative to subtract)
                </span>
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const current = parseInt(adjustment, 10) || 0
                    setAdjustment((current - 1).toString())
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="adjustment"
                  type="number"
                  placeholder="Enter adjustment (e.g., +10 or -5)"
                  value={adjustment}
                  onChange={(e) => setAdjustment(e.target.value)}
                  className="text-center font-semibold text-lg"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const current = parseInt(adjustment, 10) || 0
                    setAdjustment((current + 1).toString())
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isValidAdjustment && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  New stock will be:{' '}
                  <span className="text-lg font-bold">{newStock}</span>
                  {newStock < 0 && (
                    <span className="text-red-600 ml-2">(Warning: Negative stock)</span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-gray-500">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Reason for adjustment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={adjustStock.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidAdjustment || adjustStock.isPending}>
              {adjustStock.isPending ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}




