import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle, Edit } from 'lucide-react'
import type { WarehouseBill, WarehouseBillItem } from '@/types/api'
import { EditExitBillItems } from './EditExitBillItems'

interface WarehouseBillDetailsPageProps {
  bill: WarehouseBill | null
  companyId?: number
  onComplete?: () => void
  onCancel?: () => void
  isLoading?: boolean
  isFranchise?: boolean
  highlightedItemId?: number
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

export function WarehouseBillDetailsPage({
  bill: initialBill,
  companyId,
  onComplete,
  onCancel,
  isLoading,
  isFranchise = false,
  highlightedItemId,
}: WarehouseBillDetailsPageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [bill, setBill] = useState(initialBill)
  const highlightedRef = useRef<HTMLTableRowElement>(null)

  // Update bill when initialBill changes (e.g., after refetch)
  if (initialBill && initialBill.id !== bill?.id) {
    setBill(initialBill)
  }

  // Scroll to highlighted item when it's available
  useEffect(() => {
    if (highlightedItemId && highlightedRef.current) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 100)
    }
  }, [highlightedItemId])

  if (!bill) return null

  const hasDiscrepancies =
    bill.bill_type === 'entry' &&
    bill.items?.some((item) => item.discrepancy_type !== 'none')

  const canEdit = bill.bill_type === 'exit' && bill.status === 'draft' && !isFranchise && companyId

  // If editing, show edit component
  if (isEditing && canEdit && companyId) {
    return (
      <EditExitBillItems
        bill={bill}
        companyId={companyId}
        franchiseId={bill.franchise_id}
        onSave={(updatedBill) => {
          setBill(updatedBill)
          setIsEditing(false)
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Bill Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Bill Details</CardTitle>
          <div className="text-sm text-gray-500">Bill Number: {bill.bill_number}</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Type</div>
              <Badge variant="outline">
                {bill.bill_type === 'exit' ? 'Exit' : 'Entry'}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Status</div>
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
                <div className="text-sm text-gray-500 mb-1">Verification Status</div>
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
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="font-semibold text-lg">
                ${bill.total_amount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Created</div>
              <div>{new Date(bill.created_at).toLocaleString()}</div>
            </div>
            {bill.verified_at && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Verified</div>
                <div>{new Date(bill.verified_at).toLocaleString()}</div>
              </div>
            )}
          </div>

          {bill.notes && (
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-1">Notes</div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                {bill.notes}
              </div>
            </div>
          )}

          {hasDiscrepancies && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This bill has discrepancies. Please review the items below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
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
              {bill.items?.map((item) => {
                const isHighlighted = highlightedItemId === item.id
                return (
                <TableRow
                  key={item.id}
                  ref={isHighlighted ? highlightedRef : null}
                  className={isHighlighted
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg ring-2 ring-yellow-400 dark:ring-yellow-600'
                    : ''}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.variant_name ||
                          item.product_name ||
                          `Variant #${item.product_variant_id}`}
                      </div>
                      {item.product_name && item.variant_name && (
                        <div className="text-sm text-gray-500">
                          Product: {item.product_name}
                        </div>
                      )}
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Items
              </Button>
            )}
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
        </CardContent>
      </Card>
    </div>
  )
}

