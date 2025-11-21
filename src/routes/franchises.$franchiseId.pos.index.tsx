import { createRoute, Link } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, Receipt, TrendingUp } from 'lucide-react'
import { rootRoute } from '@/main'

export const FranchisePOSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/pos',
  component: FranchisePOSIndexPage,
})

function FranchisePOSIndexPage() {
  const { franchiseId } = FranchisePOSRoute.useParams()

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Franchise POS</h1>
        <p className="text-muted-foreground">
          Point of sale for this franchise location
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link
              to="/franchises/$franchiseId/pos/sales/new"
              params={{ franchiseId }}
            >
              <Button className="w-full">
                New Sale
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
              to="/franchises/$franchiseId/pos/cash-drawer"
              params={{ franchiseId }}
            >
              <Button variant="outline" className="w-full">
                Cash Drawer
              </Button>
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
              to="/franchises/$franchiseId/pos/sales"
              params={{ franchiseId }}
            >
              <Button variant="outline" className="w-full">
                View Sales
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      </div>
    </RoleBasedLayout>
  )
}

