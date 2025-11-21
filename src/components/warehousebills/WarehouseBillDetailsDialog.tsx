import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { WarehouseBill, WarehouseBillItem } from '@/types/api'

interface WarehouseBillDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: WarehouseBill | null
  onComplete?: () => void
  onCancel?: () => void
  isLoading?: boolean
  isFranchise?: boolean
}

const getDiscrepancyBadge = (item: WarehouseBillItem) => {
  switch (item.discrepancy_type) {
    case 'missing':
      return (
        <Badge className="bg-red-500">
          <XCircle className="h-3 w-3 mr-1" />
          Missing
        </Badge>
      )
    case 'extra':
      return (
        <Badge className="bg-yellow-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Extra
        </Badge>
      )
    case 'quantity_mismatch':
      return (
        <Badge className="bg-orange-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Mismatch
        </Badge>
      )
    default:
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          OK
        </Badge>
      )
  }
}

export function WarehouseBillDetailsDialog({
  open,
  onOpenChange,
  bill,
  onComplete,
  onCancel,
  isLoading,
  isFranchise = false,
}: WarehouseBillDetailsDialogProps) {
  if (!bill) return null

  const hasDiscrepancies =
    bill.bill_type === 'entry' &&
    bill.items?.some((item) => item.discrepancy_type !== 'none')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Warehouse Bill Details</DialogTitle>
          <DialogDescription>
            Bill Number: {bill.bill_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Type</div>
              <Badge variant="outline">
                {bill.bill_type === 'exit' ? 'Exit' : 'Entry'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <Badge
                className={
                  bill.status === 'completed'
                    ? 'bg-green-500'
                    : bill.status === 'verified'
                    ? 'bg-blue-500'
                    : bill.status === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }
              >
                {bill.status}
              </Badge>
            </div>
            {bill.bill_type === 'entry' && (
              <div>
                <div className="text-sm text-gray-500">Verification Status</div>
                <Badge
                  className={
                    bill.verification_status === 'verified'
                      ? 'bg-green-500'
                      : bill.verification_status === 'discrepancies_found'
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
                  }
                >
                  {bill.verification_status.replace('_', ' ')}
                </Badge>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="font-semibold text-lg">
                ${bill.total_amount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Created</div>
              <div>{new Date(bill.created_at).toLocaleString()}</div>
            </div>
            {bill.verified_at && (
              <div>
                <div className="text-sm text-gray-500">Verified</div>
                <div>{new Date(bill.verified_at).toLocaleString()}</div>
              </div>
            )}
          </div>

          {bill.notes && (
            <div>
              <div className="text-sm text-gray-500 mb-1">Notes</div>
              <div className="p-3 bg-gray-50 rounded-md">{bill.notes}</div>
            </div>
          )}

          {hasDiscrepancies && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This bill has discrepancies. Please review the items below.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Items Table */}
          <div>
            <div className="font-semibold mb-4">Items</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Expected</TableHead>
                  {bill.bill_type === 'entry' && (
                    <TableHead className="text-right">Received</TableHead>
                  )}
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {bill.bill_type === 'entry' && (
                    <TableHead className="text-center">Status</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.variant_name ||
                            item.product_name ||
                            `Variant #${item.product_variant_id}`}
                        </div>
                        {item.variant_sku && (
                          <div className="text-sm text-gray-500">
                            SKU: {item.variant_sku}
                          </div>
                        )}
                        {item.discrepancy_notes && (
                          <div className="text-sm text-red-600 mt-1">
                            {item.discrepancy_notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.expected_quantity || item.quantity}
                    </TableCell>
                    {bill.bill_type === 'entry' && (
                      <TableCell className="text-right">
                        {item.received_quantity ?? '-'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      ${item.unit_price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${item.total_amount.toFixed(2)}
                    </TableCell>
                    {bill.bill_type === 'entry' && (
                      <TableCell className="text-center">
                        {getDiscrepancyBadge(item)}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {onCancel &&
              bill.status === 'draft' &&
              !isFranchise && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel Bill
                </Button>
              )}
            {onComplete &&
              ((bill.bill_type === 'exit' && bill.status === 'draft') ||
                (bill.bill_type === 'entry' &&
                  bill.status === 'verified')) && (
                <Button onClick={onComplete} disabled={isLoading}>
                  {isLoading
                    ? 'Processing...'
                    : `Complete ${bill.bill_type === 'exit' ? 'Exit' : 'Entry'} Bill`}
                </Button>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

