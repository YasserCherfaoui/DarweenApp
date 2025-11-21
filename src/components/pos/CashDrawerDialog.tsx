import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type {
  CashDrawer,
  OpenCashDrawerRequest,
  CloseCashDrawerRequest,
} from '@/types/api'
import { useState } from 'react'

interface CashDrawerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'open' | 'close'
  activeDrawer?: CashDrawer
  onSubmit: (data: OpenCashDrawerRequest | CloseCashDrawerRequest) => void
  isLoading?: boolean
}

export function CashDrawerDialog({
  open,
  onOpenChange,
  type,
  activeDrawer,
  onSubmit,
  isLoading,
}: CashDrawerDialogProps) {
  const [formData, setFormData] = useState({
    balance: type === 'open' ? 0 : activeDrawer?.opening_balance || 0,
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (type === 'open') {
      onSubmit({ opening_balance: formData.balance, notes: formData.notes })
    } else {
      onSubmit({ closing_balance: formData.balance, notes: formData.notes })
    }
  }

  const expectedBalance = activeDrawer?.opening_balance
    ? activeDrawer.opening_balance +
      (activeDrawer.transactions?.reduce(
        (sum, t) =>
          sum +
          (t.transaction_type === 'sale' ? t.amount : -Math.abs(t.amount)),
        0
      ) || 0)
    : 0

  const difference = type === 'close' ? formData.balance - expectedBalance : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'open' ? 'Open' : 'Close'} Cash Drawer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'close' && activeDrawer && (
            <>
              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <div className="text-lg font-semibold">
                  ${activeDrawer.opening_balance.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Balance</Label>
                <div className="text-lg font-semibold">
                  ${expectedBalance.toFixed(2)}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="balance">
              {type === 'open' ? 'Opening' : 'Closing'} Balance
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) =>
                setFormData({ ...formData, balance: parseFloat(e.target.value) })
              }
              required
              disabled={isLoading}
            />
          </div>

          {type === 'close' && difference !== 0 && (
            <div className="space-y-2">
              <Label>Difference</Label>
              <div
                className={`text-lg font-semibold ${
                  difference > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {difference > 0 ? '+' : ''}${difference.toFixed(2)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {type === 'open' ? 'Open' : 'Close'} Drawer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

