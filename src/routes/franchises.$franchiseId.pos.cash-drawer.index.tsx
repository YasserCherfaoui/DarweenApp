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
  useActiveFranchiseCashDrawer,
  useFranchiseCashDrawers,
  useOpenCashDrawer,
  useCloseCashDrawer,
} from '@/hooks/queries/use-pos-queries'
import { DollarSign, Lock, Unlock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { rootRoute } from '@/main'

export const FranchiseCashDrawerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/pos/cash-drawer',
  component: FranchiseCashDrawerPage,
})

function FranchiseCashDrawerPage() {
  const { franchiseId } = FranchiseCashDrawerRoute.useParams()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'open' | 'close'>('open')

  const { data: activeDrawer, refetch: refetchActive } = useActiveFranchiseCashDrawer(Number(franchiseId))
  const { data: drawersData } = useFranchiseCashDrawers(Number(franchiseId))
  const openDrawer = useOpenCashDrawer()
  const closeDrawer = useCloseCashDrawer()

  const handleOpenDrawer = (data: any) => {
    openDrawer.mutate(
      { companyId: 0, data: { ...data, franchise_id: Number(franchiseId) } },
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
    if (!activeDrawer?.data) return

    closeDrawer.mutate(
      { companyId: 0, drawerId: activeDrawer.data.id, data },
      {
        onSuccess: () => {
          toast({
            title: 'Cash drawer closed',
            description: 'Cash drawer has been closed successfully',
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

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/franchises/$franchiseId/pos" params={{ franchiseId }}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Cash Drawer</h1>
            <p className="text-muted-foreground">Manage cash drawer operations</p>
          </div>
        </div>
        {activeDrawer?.data ? (
          <Button
            onClick={() => {
              setDialogType('close')
              setDialogOpen(true)
            }}
            variant="destructive"
          >
            <Lock className="h-4 w-4 mr-2" />
            Close Drawer
          </Button>
        ) : (
          <Button
            onClick={() => {
              setDialogType('open')
              setDialogOpen(true)
            }}
          >
            <Unlock className="h-4 w-4 mr-2" />
            Open Drawer
          </Button>
        )}
      </div>

      {activeDrawer?.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Active Cash Drawer
            </CardTitle>
            <CardDescription>
              Opened on {new Date(activeDrawer.data.opened_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold">${activeDrawer.data.opening_balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Balance</p>
                <p className="text-2xl font-bold">
                  ${activeDrawer.data.expected_balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-green-500 text-white">Open</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Opened By</p>
                <p className="text-lg font-medium">User #{activeDrawer.data.opened_by_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cash Drawer History</CardTitle>
          <CardDescription>View past cash drawer sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {drawersData?.data && drawersData.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opened</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Closing Balance</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawersData.data.map((drawer) => (
                  <TableRow key={drawer.id}>
                    <TableCell>
                      {new Date(drawer.opened_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {drawer.closed_at ? new Date(drawer.closed_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>${drawer.opening_balance.toFixed(2)}</TableCell>
                    <TableCell>
                      {drawer.closing_balance ? `$${drawer.closing_balance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {drawer.expected_balance ? `$${drawer.expected_balance.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {drawer.difference !== undefined && drawer.difference !== null ? (
                        <span
                          className={
                            drawer.difference === 0
                              ? 'text-green-600'
                              : drawer.difference > 0
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }
                        >
                          {drawer.difference > 0 ? '+' : ''}${drawer.difference.toFixed(2)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          drawer.status === 'open'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }
                      >
                        {drawer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No cash drawer history</p>
          )}
        </CardContent>
      </Card>

      <CashDrawerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        onSubmit={dialogType === 'open' ? handleOpenDrawer : handleCloseDrawer}
        activeDrawer={activeDrawer?.data}
        isLoading={openDrawer.isPending || closeDrawer.isPending}
      />
      </div>
    </RoleBasedLayout>
  )
}

