import { createRoute, redirect } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Package, Store, Warehouse, ShoppingCart } from 'lucide-react'
import { rootRoute } from '@/main'
import { portalStore } from '@/stores/portal-store'
import { companyStore } from '@/stores/company-store'
import { useDashboardAnalytics } from '@/hooks/queries/use-dashboard'

export const DashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
  beforeLoad: async () => {
    const portalState = portalStore.state
    // Redirect franchise portal users to their franchise dashboard
    if (portalState.selectedPortalType === 'franchise' && portalState.selectedPortalId) {
      throw redirect({
        to: `/franchises/${portalState.selectedPortalId}` as any,
        replace: true,
      })
    }
  },
})

function DashboardPage() {
  const companyId = companyStore.state.selectedCompanyId
  const { data: analytics, isLoading } = useDashboardAnalytics(companyId || 0)

  const stats = [
    {
      title: 'Products',
      value: analytics?.total_products?.toString() || '0',
      description: 'Total products',
      icon: Package,
      isLoading,
    },
    {
      title: 'Franchises',
      value: analytics?.total_franchises?.toString() || '0',
      description: 'Active franchises',
      icon: Store,
      isLoading,
    },
    {
      title: 'Inventory Items',
      value: analytics?.total_inventory_items?.toString() || '0',
      description: 'In stock',
      icon: Warehouse,
      isLoading,
    },
    {
      title: 'Orders',
      value: analytics?.total_orders?.toString() || '0',
      description: 'Total orders',
      icon: ShoppingCart,
      isLoading,
    },
  ]

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Welcome to your ERP dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.isLoading ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your ERP system by completing these steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  1
                </div>
                <div>
                  <p className="font-medium">Create your first company</p>
                  <p className="text-sm text-gray-500">
                    Set up your company profile to start managing your business
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-500">Add your products</p>
                  <p className="text-sm text-gray-500">
                    Create products and variants for your inventory
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-500">Set up franchises</p>
                  <p className="text-sm text-gray-500">
                    Create franchise locations to manage inventory
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



