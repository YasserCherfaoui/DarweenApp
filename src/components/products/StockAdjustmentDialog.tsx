import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Package } from 'lucide-react'

interface StockAdjustmentDialogProps {
  variantName: string
  currentStock: number
  onAdjust: (amount: number) => void
  isLoading?: boolean
}

export function StockAdjustmentDialog({
  variantName,
  currentStock,
  onAdjust,
  isLoading,
}: StockAdjustmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdjust(amount)
    setOpen(false)
    setAmount(0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package className="mr-2 h-4 w-4" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Adjust the stock level for {variantName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Stock</Label>
            <Input value={currentStock} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Adjustment Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter positive or negative number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Positive numbers add stock, negative numbers remove stock
            </p>
          </div>
          <div className="space-y-2">
            <Label>New Stock Level</Label>
            <Input value={currentStock + amount} disabled />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || amount === 0} className="flex-1">
              {isLoading ? 'Adjusting...' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



