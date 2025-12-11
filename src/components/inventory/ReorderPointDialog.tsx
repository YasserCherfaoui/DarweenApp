import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateReorderPoint } from '@/hooks/queries/use-inventory'
import type { Inventory } from '@/types/api'
import { useEffect, useState } from 'react'

interface ReorderPointDialogProps {
  inventory: Inventory | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReorderPointDialog({ inventory, open, onOpenChange }: ReorderPointDialogProps) {
  const [value, setValue] = useState<string>('')
  const mutation = useUpdateReorderPoint(inventory?.id || 0)

  useEffect(() => {
    if (inventory) {
      setValue(
        inventory.reorder_point === null || inventory.reorder_point === undefined
          ? ''
          : inventory.reorder_point.toString()
      )
    }
  }, [inventory])

  const handleClose = () => {
    setValue('')
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inventory) return

    const parsed =
      value.trim() === '' ? null : Number.isNaN(Number(value)) ? null : Number(value)

    if (parsed !== null && parsed < 0) {
      return
    }

    try {
      await mutation.mutateAsync({ reorder_point: parsed })
      handleClose()
    } catch (error) {
      // handled in hook
    }
  }

  const isValid = value.trim() === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Reorder Point</DialogTitle>
            <DialogDescription>
              Alert when available stock for this variant reaches or drops below this number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div>
              <p className="text-sm font-semibold">{inventory?.product_name}</p>
              <p className="text-sm text-muted-foreground">
                {inventory?.variant_name} — {inventory?.variant_sku || 'No SKU'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderPoint">Reorder point</Label>
              <Input
                id="reorderPoint"
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 5"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to use the default alert threshold.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
