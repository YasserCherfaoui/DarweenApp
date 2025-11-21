import { createRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useSales } from '@/hooks/queries/use-pos-queries'
import { Eye, ArrowLeft } from 'lucide-react'
import type { Sale } from '@/types/api'
import { rootRoute } from '@/main'

export const SalesHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/pos/sales',
  component: SalesHistoryPage,
})

function SalesHistoryPage() {
  const { companyId } = SalesHistoryRoute.useParams()
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: salesData, isLoading } = useSales(Number(companyId))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500'
      case 'partially_paid':
        return 'bg-yellow-500'
      case 'unpaid':
        return 'bg-red-500'
      case 'refunded':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setDetailsOpen(true)
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-4">
            <Link to="/companies/$companyId/pos" params={{ companyId }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Sales History</h1>
              <p className="text-muted-foreground">View all sales transactions</p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading fullScreen={false} size="md" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData?.data?.map((sale: Sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.receipt_number}
                    </TableCell>
                    <TableCell>
                      {new Date(sale.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sale.customer?.name || 'Walk-in'}
                    </TableCell>
                    <TableCell>{sale.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">
                      ${sale.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sale.payment_status)}>
                        {sale.payment_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(sale)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Receipt Number</div>
                  <div className="font-medium">{selectedSale.receipt_number}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {new Date(selectedSale.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Customer</div>
                  <div className="font-medium">
                    {selectedSale.customer?.name || 'Walk-in Customer'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Payment Status</div>
                  <Badge className={getStatusColor(selectedSale.payment_status)}>
                    {selectedSale.payment_status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-semibold mb-2">Items</div>
                <div className="space-y-2">
                  {selectedSale.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        Item #{index + 1} (Qty: {item.quantity})
                      </div>
                      <div className="font-medium">
                        ${item.total_amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedSale.sub_total.toFixed(2)}</span>
                </div>
                {selectedSale.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>${selectedSale.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {selectedSale.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount:</span>
                    <span>-${selectedSale.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${selectedSale.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {selectedSale.payments && selectedSale.payments.length > 0 && (
                <div className="border-t pt-4">
                  <div className="font-semibold mb-2">Payments</div>
                  <div className="space-y-2">
                    {selectedSale.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="capitalize">{payment.payment_method}</span>
                        <span>${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </RoleBasedLayout>
  )
}

