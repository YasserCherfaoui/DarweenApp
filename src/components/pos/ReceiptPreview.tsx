import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import type { Sale } from '@/types/api'

interface ReceiptPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Sale
  companyName: string
  franchiseName?: string
}

export function ReceiptPreview({
  open,
  onOpenChange,
  sale,
  companyName,
  franchiseName,
}: ReceiptPreviewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 font-mono text-sm">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <div className="font-bold text-lg">{companyName}</div>
            {franchiseName && (
              <div className="text-gray-600">{franchiseName}</div>
            )}
            <div className="text-gray-600 mt-2">
              Receipt: {sale.receipt_number}
            </div>
            <div className="text-gray-600">
              {new Date(sale.created_at).toLocaleString()}
            </div>
          </div>

          {/* Customer */}
          {sale.customer && (
            <div className="border-b pb-2">
              <div className="text-gray-600">Customer: {sale.customer.name}</div>
              {sale.customer.email && (
                <div className="text-gray-600 text-xs">{sale.customer.email}</div>
              )}
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            {sale.items?.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex-1">
                  <div>Item #{index + 1}</div>
                  <div className="text-xs text-gray-600">
                    {item.quantity} x ${item.unit_price.toFixed(2)}
                  </div>
                  {item.discount_amount > 0 && (
                    <div className="text-xs text-red-600">
                      Discount: -${item.discount_amount.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="font-semibold">
                  ${item.total_amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${sale.sub_total.toFixed(2)}</span>
            </div>
            {sale.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${sale.tax_amount.toFixed(2)}</span>
              </div>
            )}
            {sale.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount:</span>
                <span>-${sale.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${sale.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payments */}
          {sale.payments && sale.payments.length > 0 && (
            <div className="border-t pt-2 space-y-1">
              <div className="font-semibold">Payments:</div>
              {sale.payments.map((payment, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="capitalize">{payment.payment_method}:</span>
                  <span>${payment.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-600 border-t pt-4">
            <div>Thank you for your business!</div>
            <div className="mt-1">
              Status: <span className="capitalize">{sale.payment_status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

