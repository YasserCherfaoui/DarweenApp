import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AddPaymentRequest, PaymentMethod } from '@/types/api'
import { useState } from 'react'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  onSubmit: (data: AddPaymentRequest) => void
  isLoading?: boolean
}

export function PaymentDialog({
  open,
  onOpenChange,
  totalAmount,
  onSubmit,
  isLoading,
}: PaymentDialogProps) {
  const [formData, setFormData] = useState<AddPaymentRequest>({
    payment_method: 'cash', // Cash only for now
    amount: totalAmount,
    reference: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const change = formData.amount - totalAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Total Amount</Label>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="text-lg font-medium">Cash</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount Received</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              required
              disabled={isLoading}
            />
          </div>

          {change >= 0 && (
            <div className="space-y-2">
              <Label>Change</Label>
              <div className="text-xl font-semibold text-green-600">
                ${change.toFixed(2)}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
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
            <Button type="submit" disabled={isLoading || formData.amount < totalAmount}>
              Complete Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

