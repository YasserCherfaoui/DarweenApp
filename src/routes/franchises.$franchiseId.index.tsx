import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { NotFound } from '@/components/ui/not-found'
import { useFranchise } from '@/hooks/queries/use-franchises'
import { rootRoute } from '@/main'
import { createRoute } from '@tanstack/react-router'
import { Store, Package, Warehouse, FileText, ShoppingCart } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const FranchiseDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId',
  component: FranchiseDashboardPage,
})

function FranchiseDashboardPage() {
  const { franchiseId } = FranchiseDashboardRoute.useParams()
  const franchiseIdNum = Number(franchiseId)
  const { data: franchise, isLoading } = useFranchise(franchiseIdNum)

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!franchise) {
    return (
      <RoleBasedLayout>
        <NotFound 
          title="Franchise not found"
          message="The franchise you're looking for doesn't exist or you don't have access to it."
          backTo="/"
          backLabel="Back to Dashboard"
        />
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {franchise.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Code: {franchise.code}
            </p>
          </div>
          <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
            {franchise.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Franchise Details</CardTitle>
              <CardDescription>Basic information about the franchise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-lg">{franchise.name}</p>
              </div>
              <div className="h-px bg-gray-200 dark:bg-gray-700" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Code
                </p>
                <p className="mt-1 font-mono">{franchise.code}</p>
              </div>
              {franchise.description && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </p>
                    <p className="mt-1">{franchise.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access franchise features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Link to={`/franchises/${franchiseId}/products` as any}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium">Products</p>
                        <p className="text-xs text-muted-foreground">View products</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to={`/franchises/${franchiseId}/inventory` as any}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Warehouse className="h-6 w-6 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="font-medium">Inventory</p>
                        <p className="text-xs text-muted-foreground">Manage stock</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to={`/franchises/${franchiseId}/warehouse-bills` as any}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-medium">Warehouse Bills</p>
                        <p className="text-xs text-muted-foreground">View bills</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link to={`/franchises/${franchiseId}/pos` as any}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <ShoppingCart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="font-medium">POS</p>
                        <p className="text-xs text-muted-foreground">Point of sale</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to {franchise.name}</CardTitle>
            <CardDescription>
              Manage your franchise operations from this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Franchise Portal</p>
                  <p className="text-sm text-gray-500">
                    You're viewing the franchise dashboard for {franchise.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">View Products</p>
                  <p className="text-sm text-gray-500">
                    Browse products and pricing available to this franchise
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Warehouse className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Manage Inventory</p>
                  <p className="text-sm text-gray-500">
                    Track stock levels and inventory movements
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

