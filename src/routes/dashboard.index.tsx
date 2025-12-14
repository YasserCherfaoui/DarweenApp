import { ContextIndicator } from '@/components/auth/ContextIndicator'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardAnalytics } from '@/hooks/queries/use-dashboard'
import { rootRoute } from '@/main'
import { companyStore } from '@/stores/company-store'
import { portalStore } from '@/stores/portal-store'
import { Link, createRoute, redirect } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ArrowRight, Building2, FileText, LayoutDashboard, Package, Plus, ShoppingBag, ShoppingCart, Store, Truck, Warehouse } from 'lucide-react'

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
  const { selectedCompany, selectedCompanyId } = useStore(companyStore)
  const { selectedPortal, selectedPortalId } = useStore(portalStore)
  const companyId = selectedPortalId && selectedPortal?.type === 'company' 
    ? selectedPortalId 
    : selectedCompanyId
  const { data: analytics, isLoading } = useDashboardAnalytics(companyId || 0)

  // Check if we have a company context (either through portal or direct selection)
  const hasCompanyContext = !!companyId
  const activeCompany = selectedPortal?.type === 'company' 
    ? { name: selectedPortal.name, code: selectedPortal.code }
    : selectedCompany
      ? { name: selectedCompany.name, code: selectedCompany.code }
      : null

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

  const quickActions = companyId ? [
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: Package,
      href: `/companies/${companyId}/products`,
    },
    {
      title: 'Orders',
      description: 'View and manage orders',
      icon: ShoppingBag,
      href: `/companies/${companyId}/orders`,
    },
    {
      title: 'Inventory',
      description: 'Track inventory levels',
      icon: Warehouse,
      href: `/companies/${companyId}/inventory`,
    },
    {
      title: 'Suppliers',
      description: 'Manage supplier relationships',
      icon: Truck,
      href: `/companies/${companyId}/suppliers`,
    },
    {
      title: 'Warehouse Bills',
      description: 'Manage warehouse transactions',
      icon: FileText,
      href: `/companies/${companyId}/warehouse-bills`,
    },
    {
      title: 'POS',
      description: 'Point of sale system',
      icon: ShoppingCart,
      href: `/companies/${companyId}/pos`,
    },
  ] : []

  // Empty state when no company is selected
  if (!hasCompanyContext) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Overview and analytics for your business
            </p>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <Building2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Company Selected</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Select a company from your companies page to view its dashboard with analytics, 
                  statistics, and quick access to key operations.
                </p>
                <div className="flex gap-4">
                  <Link to="/companies">
                    <Button size="lg" variant="default">
                      <Building2 className="mr-2 h-5 w-5" />
                      View Companies
                    </Button>
                  </Link>
                  <Link to="/companies/create">
                    <Button size="lg" variant="outline">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Company
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Create your first company</p>
                      <Link to="/companies/create">
                        <Button variant="link" size="sm" className="p-0 h-auto">
                          Get started
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
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

  // Dashboard with company context
  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Context Banner */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <ContextIndicator variant="default" />
              <Badge variant="secondary" className="text-xs">
                Company Overview
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
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

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Access frequently used features and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.title} to={action.href as any}>
                      <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Getting Started - only show if stats are all zero */}
        {!isLoading && analytics && 
         analytics.total_products === 0 && 
         analytics.total_orders === 0 && 
         analytics.total_inventory_items === 0 && (
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
                    <p className="font-medium">Add your products</p>
                    <p className="text-sm text-gray-500">
                      Create products and variants for your inventory
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Set up franchises</p>
                    <p className="text-sm text-gray-500">
                      Create franchise locations to manage inventory
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Create your first order</p>
                    <p className="text-sm text-gray-500">
                      Start processing orders and managing your sales
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}



