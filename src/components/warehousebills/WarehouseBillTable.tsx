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
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import type { WarehouseBill } from '@/types/api'
import { Link } from '@tanstack/react-router'

interface WarehouseBillTableProps {
  bills: WarehouseBill[]
  companyId?: number
  franchiseId?: number
}

const getBillStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'verified':
      return 'bg-blue-500'
    case 'draft':
      return 'bg-gray-500'
    case 'cancelled':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getVerificationStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-500'
    case 'discrepancies_found':
      return 'bg-yellow-500'
    case 'pending':
      return 'bg-gray-500'
    default:
      return 'bg-gray-500'
  }
}

export function WarehouseBillTable({
  bills,
  companyId,
  franchiseId,
  onView,
}: WarehouseBillTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bill Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Verification</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              No bills found
            </TableCell>
          </TableRow>
        ) : (
          bills.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">{bill.bill_number}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {bill.bill_type === 'exit' ? 'Exit' : 'Entry'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(bill.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>${bill.total_amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge className={getBillStatusColor(bill.status)}>
                  {bill.status}
                </Badge>
              </TableCell>
              <TableCell>
                {bill.bill_type === 'entry' ? (
                  <Badge className={getVerificationStatusColor(bill.verification_status)}>
                    {bill.verification_status.replace('_', ' ')}
                  </Badge>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {companyId && (
                    <Link
                      to="/companies/$companyId/warehouse-bills/$billId"
                      params={{
                        companyId: companyId.toString(),
                        billId: bill.id.toString(),
                      }}
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {franchiseId && (
                    <Link
                      to="/franchises/$franchiseId/warehouse-bills/$billId"
                      params={{
                        franchiseId: franchiseId.toString(),
                        billId: bill.id.toString(),
                      }}
                    >
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
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

