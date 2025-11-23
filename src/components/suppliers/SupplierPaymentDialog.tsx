import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { RecordSupplierPaymentRequest, PaymentMethod } from '@/types/api'

interface SupplierPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: RecordSupplierPaymentRequest) => void
  isLoading?: boolean
  supplierId: number
  outstandingAmount?: number
}

export function SupplierPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  supplierId,
  outstandingAmount = 0,
}: SupplierPaymentDialogProps) {
  const [formData, setFormData] = useState<RecordSupplierPaymentRequest>({
    supplier_id: supplierId,
    amount: outstandingAmount > 0 ? outstandingAmount : 0,
    payment_method: 'cash',
    reference: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
    // Reset form
    setFormData({
      supplier_id: supplierId,
      amount: outstandingAmount > 0 ? outstandingAmount : 0,
      payment_method: 'cash',
      reference: '',
      notes: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Supplier Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {outstandingAmount > 0 && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Label>Outstanding Amount</Label>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${outstandingAmount.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Payment will be automatically distributed to unpaid bills (oldest first)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value: PaymentMethod) =>
                setFormData({ ...formData, payment_method: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) =>
                setFormData({ ...formData, reference: e.target.value })
              }
              placeholder="Check number, transaction ID, etc."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about this payment..."
              rows={3}
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
            <Button type="submit" disabled={isLoading || formData.amount <= 0}>
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


