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
import { useSupplierBill } from '@/hooks/queries/use-supplier-bills'
import { BillItemList } from './BillItemList'
import { Link } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'

interface SupplierBillDetailsDialogProps {
  companyId: number
  supplierId: number
  billId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete?: (billId: number) => void
  highlightedItemId?: number // Item ID to highlight when opened from inventory movement
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-500'
    case 'partially_paid':
      return 'bg-yellow-500'
    case 'unpaid':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getBillStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-blue-500'
    case 'draft':
      return 'bg-gray-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export function SupplierBillDetailsDialog({
  companyId,
  supplierId,
  billId,
  open,
  onOpenChange,
  onDelete,
  highlightedItemId,
}: SupplierBillDetailsDialogProps) {
  const { data: bill, isLoading } = useSupplierBill(companyId, supplierId, billId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
          <DialogDescription>
            Detailed information about bill #{bill?.bill_number || billId}
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
          ) : !bill ? (
            <div className="text-center py-8 text-gray-500">
              Bill not found
            </div>
          ) : (
            <>
              {/* Bill Header */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bill Number</p>
                  <p className="text-lg font-semibold">{bill.bill_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(bill.created_at).toLocaleString()}
                  </p>
                </div>
                {bill.supplier && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                    <p className="text-lg font-semibold">{bill.supplier.name}</p>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge className={getPaymentStatusColor(bill.payment_status)}>
                  Payment: {bill.payment_status.replace('_', ' ')}
                </Badge>
                <Badge className={getBillStatusColor(bill.bill_status)}>
                  Status: {bill.bill_status}
                </Badge>
              </div>

              {/* Items */}
              {bill.items && bill.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Items</h4>
                  <BillItemList items={bill.items} highlightedItemId={highlightedItemId} />
                </div>
              )}

              {/* Totals */}
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="text-sm font-semibold mb-2">Totals</h4>
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span>${bill.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid Amount:</span>
                  <span className="text-green-600">${bill.paid_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Pending Amount:</span>
                  <span className="text-red-600">${bill.pending_amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payments */}
              {bill.payments && bill.payments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Payments</h4>
                  <div className="border rounded-lg divide-y">
                    {bill.payments.map((payment, index) => (
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
                            {payment.distributions && payment.distributions.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Applied to {payment.distributions.length} bill(s)
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
              {bill.notes && (
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{bill.notes}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          {bill && bill.bill_status === 'draft' && (
            <>
              <Link
                to="/companies/$companyId/suppliers/$supplierId/bills/$billId/edit"
                params={{
                  companyId: companyId.toString(),
                  supplierId: supplierId.toString(),
                  billId: bill.id.toString(),
                }}
              >
                <Button variant="outline">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Bill
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this bill?')) {
                      onDelete(bill.id)
                      onOpenChange(false)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

