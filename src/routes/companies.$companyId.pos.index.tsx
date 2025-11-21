import { createRoute, Link } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Receipt, Users, TrendingUp } from 'lucide-react'
import { rootRoute } from '@/main'

export const POSIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/pos',
  component: POSIndexPage,
})

function POSIndexPage() {
  const { companyId } = POSIndexRoute.useParams()

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Point of Sale</h1>
        <p className="text-muted-foreground">
          Manage sales, customers, and cash operations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sale</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              to="/companies/$companyId/pos/sales/new"
              params={{ companyId }}
            >
              <Button className="w-full">Create Sale</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales History</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              to="/companies/$companyId/pos/sales"
              params={{ companyId }}
            >
              <Button variant="outline" className="w-full">
                View Sales
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              to="/companies/$companyId/pos/customers"
              params={{ companyId }}
            >
              <Button variant="outline" className="w-full">
                Manage Customers
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Drawer</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              to="/companies/$companyId/pos/cash-drawer"
              params={{ companyId }}
            >
              <Button variant="outline" className="w-full">
                Manage Drawer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick guide to using the POS system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">1. Open Cash Drawer</h3>
            <p className="text-sm text-muted-foreground">
              Before making sales, open the cash drawer with the starting cash amount.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">2. Create Sales</h3>
            <p className="text-sm text-muted-foreground">
              Add products to cart, select customer (optional), and process payment.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">3. Close Cash Drawer</h3>
            <p className="text-sm text-muted-foreground">
              At end of shift, count cash and close drawer to reconcile sales.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </RoleBasedLayout>
  )
}

