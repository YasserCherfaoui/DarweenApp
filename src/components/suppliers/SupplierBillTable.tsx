import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { SupplierBill } from '@/types/api'
import { Link } from '@tanstack/react-router'

interface SupplierBillTableProps {
  bills: SupplierBill[]
  companyId: number
  supplierId: number
  onView?: (bill: SupplierBill) => void
  onEdit?: (bill: SupplierBill) => void
  onDelete?: (billId: number) => void
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

export function SupplierBillTable({
  bills,
  companyId,
  supplierId,
  onView,
  onEdit,
  onDelete,
}: SupplierBillTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bill Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Paid Amount</TableHead>
          <TableHead>Pending Amount</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Bill Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              No bills found
            </TableCell>
          </TableRow>
        ) : (
          bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">{bill.bill_number}</TableCell>
              <TableCell>
                {new Date(bill.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>${bill.total_amount.toFixed(2)}</TableCell>
              <TableCell>${bill.paid_amount.toFixed(2)}</TableCell>
              <TableCell className="font-semibold">
                ${bill.pending_amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <Badge className={getPaymentStatusColor(bill.payment_status)}>
                  {bill.payment_status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getBillStatusColor(bill.bill_status)}>
                  {bill.bill_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onView && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(bill)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && bill.bill_status === 'draft' && (
                    <Link
                      to="/companies/$companyId/suppliers/$supplierId/bills/$billId/edit"
                      params={{
                        companyId: companyId.toString(),
                        supplierId: supplierId.toString(),
                        billId: bill.id.toString(),
                      }}
                    >
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {onDelete && bill.bill_status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(bill.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

