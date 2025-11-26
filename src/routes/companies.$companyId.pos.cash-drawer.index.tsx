import { createRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CashDrawerDialog } from '@/components/pos/CashDrawerDialog'
import {
  useActiveCashDrawer,
  useCashDrawers,
  useOpenCashDrawer,
  useCloseCashDrawer,
} from '@/hooks/queries/use-pos-queries'
import { DollarSign, Lock, Unlock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { rootRoute } from '@/main'

export const CashDrawerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/pos/cash-drawer',
  component: CashDrawerPage,
})

function CashDrawerPage() {
  const { companyId } = CashDrawerRoute.useParams()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'open' | 'close'>('open')

  const { data: activeDrawer, refetch: refetchActive } = useActiveCashDrawer(Number(companyId))
  const { data: drawersData } = useCashDrawers(Number(companyId))
  const openDrawer = useOpenCashDrawer()
  const closeDrawer = useCloseCashDrawer()

  const handleOpenDrawer = (data: any) => {
    openDrawer.mutate(
      { companyId: Number(companyId), data },
      {
        onSuccess: () => {
          toast({
            title: 'Cash drawer opened',
            description: 'Cash drawer has been opened successfully',
          })
          setDialogOpen(false)
          refetchActive()
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to open drawer',
            description: error.message || 'An error occurred',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleCloseDrawer = (data: any) => {
    if (!activeDrawer) return

    closeDrawer.mutate(
      {
        companyId: Number(companyId),
        drawerId: activeDrawer.id,
        data,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Cash drawer closed',
            description: 'Cash drawer has been closed and reconciled',
          })
          setDialogOpen(false)
          refetchActive()
        },
        onError: (error: any) => {
          toast({
            title: 'Failed to close drawer',
            description: error.message || 'An error occurred',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const expectedBalance = activeDrawer
    ? activeDrawer.opening_balance +
      (activeDrawer.transactions?.reduce(
        (sum: number, t: any) =>
          sum +
          (t.transaction_type === 'sale' ? t.amount : -Math.abs(t.amount)),
        0
      ) || 0)
    : 0

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
              <h1 className="text-3xl font-bold">Cash Drawer Management</h1>
              <p className="text-muted-foreground">
                Manage cash drawer operations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Drawer Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Cash Drawer</CardTitle>
          <CardDescription>
            {activeDrawer
              ? 'Cash drawer is currently open'
              : 'No active cash drawer'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDrawer ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge className="bg-green-500">
                    <Unlock className="h-3 w-3 mr-1" />
                    Open
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Opening Balance</div>
                  <div className="text-xl font-semibold">
                    ${activeDrawer.opening_balance.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Expected Balance</div>
                  <div className="text-xl font-semibold text-primary">
                    ${expectedBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Transactions</div>
                <div className="text-2xl font-bold">
                  {activeDrawer.transactions?.length || 0} transactions
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Opened By</div>
                <div>
                  User #{activeDrawer.opened_by_id} at{' '}
                  {new Date(activeDrawer.opened_at).toLocaleString()}
                </div>
              </div>

              <Button
                onClick={() => {
                  setDialogType('close')
                  setDialogOpen(true)
                }}
                variant="destructive"
              >
                <Lock className="h-4 w-4 mr-2" />
                Close Cash Drawer
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                No cash drawer is currently open. Open a drawer to start
                accepting cash payments.
              </p>
              <Button
                onClick={() => {
                  setDialogType('open')
                  setDialogOpen(true)
                }}
              >
                <Unlock className="h-4 w-4 mr-2" />
                Open Cash Drawer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer History */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Drawer History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opened</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead>Opening Balance</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drawersData?.data?.map((drawer: any) => (
                <TableRow key={drawer.id}>
                  <TableCell>
                    {new Date(drawer.opened_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {drawer.closed_at
                      ? new Date(drawer.closed_at).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    ${drawer.opening_balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {drawer.expected_balance
                      ? `$${drawer.expected_balance.toFixed(2)}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {drawer.closing_balance
                      ? `$${drawer.closing_balance.toFixed(2)}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {drawer.difference ? (
                      <span
                        className={
                          drawer.difference > 0
                            ? 'text-green-600'
                            : drawer.difference < 0
                            ? 'text-red-600'
                            : ''
                        }
                      >
                        {drawer.difference > 0 ? '+' : ''}$
                        {drawer.difference.toFixed(2)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        drawer.status === 'open'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      }
                    >
                      {drawer.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cash Drawer Dialog */}
      <CashDrawerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        activeDrawer={activeDrawer}
        onSubmit={dialogType === 'open' ? handleOpenDrawer : handleCloseDrawer}
        isLoading={openDrawer.isPending || closeDrawer.isPending}
      />
      </div>
    </RoleBasedLayout>
  )
}

