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
import { useFranchiseSales } from '@/hooks/queries/use-pos-queries'
import { Eye, ArrowLeft } from 'lucide-react'
import type { Sale } from '@/types/api'
import { rootRoute } from '@/main'
import { SaleDetailsDialog } from '@/components/pos/SaleDetailsDialog'

export const FranchiseSalesHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/pos/sales',
  component: FranchiseSalesHistoryPage,
})

function FranchiseSalesHistoryPage() {
  const { franchiseId } = FranchiseSalesHistoryRoute.useParams()
  const [selectedSale, setSelectedSale] = useState<Sale | undefined>()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: salesData, isLoading } = useFranchiseSales(Number(franchiseId))

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
            <Link to="/franchises/$franchiseId/pos" params={{ franchiseId }}>
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
                {salesData?.data && salesData.data.length > 0 ? (
                  salesData.data.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.receipt_number}</TableCell>
                      <TableCell>
                        {new Date(sale.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sale.customer?.name || 'Walk-in Customer'}
                      </TableCell>
                      <TableCell>{sale.items?.length || 0}</TableCell>
                      <TableCell className="font-medium">
                        ${sale.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusColor(sale.payment_status)} text-white`}
                        >
                          {sale.payment_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(sale)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sales found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedSale && (
        <SaleDetailsDialog
          sale={selectedSale}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
      </div>
    </RoleBasedLayout>
  )
}

