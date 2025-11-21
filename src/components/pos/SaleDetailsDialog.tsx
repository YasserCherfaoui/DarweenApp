import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useSale } from '@/hooks/queries/use-pos-queries'
import { apiClient } from '@/lib/api-client'
import { Printer } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SaleDetailsDialogProps {
  companyId: number
  saleId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleDetailsDialog({
  companyId,
  saleId,
  open,
  onOpenChange,
}: SaleDetailsDialogProps) {
  const { toast } = useToast()
  const [isPrinting, setIsPrinting] = useState(false)
  const { data: sale, isLoading } = useSale(companyId, saleId)

  const handlePrintReceipt = async () => {
    if (!sale) return

    setIsPrinting(true)
    try {
      const blob = await apiClient.pos.sales.getReceipt(companyId, sale.id)
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        // Wait for PDF to load, then trigger print
        // Use a longer delay to ensure PDF viewer is ready
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            try {
              printWindow.print()
              // Clean up URL after a delay, but don't auto-close window
              // Let the user close it manually after printing
              setTimeout(() => {
                window.URL.revokeObjectURL(url)
              }, 1000)
            } catch (e) {
              // If print fails, just revoke the URL
              window.URL.revokeObjectURL(url)
            }
          } else {
            window.URL.revokeObjectURL(url)
          }
        }, 1000) // Wait 1 second for PDF to load
      } else {
        // Fallback: download the PDF
        const link = document.createElement('a')
        link.href = url
        link.download = `receipt_${sale.receipt_number}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error: any) {
      toast({
        title: 'Failed to print receipt',
        description: error.message || 'Failed to fetch receipt PDF',
        variant: 'destructive',
      })
    } finally {
      setIsPrinting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Sale Details</DialogTitle>
          <DialogDescription>
            Detailed information about sale #{sale?.receipt_number || saleId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </>
          ) : !sale ? (
            <div className="text-center py-8 text-gray-500">
              Sale not found
            </div>
          ) : (
            <>
              {/* Sale Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receipt Number</p>
                  <p className="text-lg font-semibold">{sale.receipt_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(sale.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge
                  variant={
                    sale.payment_status === 'paid'
                      ? 'default'
                      : sale.payment_status === 'partially_paid'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  Payment: {sale.payment_status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  Status: {sale.sale_status}
                </Badge>
              </div>

              {/* Customer Info */}
              {sale.customer && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Customer</h4>
                  <p className="text-sm">{sale.customer.name}</p>
                  {sale.customer.email && (
                    <p className="text-xs text-gray-500">{sale.customer.email}</p>
                  )}
                  {sale.customer.phone && (
                    <p className="text-xs text-gray-500">{sale.customer.phone}</p>
                  )}
                </div>
              )}

              {/* Items */}
              {sale.items && sale.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Items</h4>
                  <div className="border rounded-lg divide-y">
                    {sale.items.map((item, index) => (
                      <div key={item.id || index} className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            {item.product_name && item.variant_name ? (
                              <div>
                                <p className="text-sm font-medium">
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {item.variant_name}
                                  {item.variant_sku && ` (SKU: ${item.variant_sku})`}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm font-medium">
                                Product Variant #{item.product_variant_id}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {item.quantity} × ${item.unit_price.toFixed(2)}
                              {item.discount_amount > 0 && (
                                <span className="text-red-600 ml-2">
                                  - ${item.discount_amount.toFixed(2)} discount
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              ${item.total_amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Sub: ${item.sub_total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="text-sm font-semibold mb-2">Totals</h4>
                <div className="flex justify-between text-sm">
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
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>${sale.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payments */}
              {sale.payments && sale.payments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Payments</h4>
                  <div className="border rounded-lg divide-y">
                    {sale.payments.map((payment, index) => (
                      <div key={payment.id || index} className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {payment.payment_method}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {payment.payment_status.replace('_', ' ')}
                            </p>
                            {payment.reference && (
                              <p className="text-xs text-gray-500">
                                Ref: {payment.reference}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold">
                            ${payment.amount.toFixed(2)}
                          </p>
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {sale.notes && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{sale.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            onClick={handlePrintReceipt}
            disabled={!sale || isPrinting}
            variant="outline"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print Receipt'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

