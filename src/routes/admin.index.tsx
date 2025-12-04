import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, CreditCard, Package, Store } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminAnalytics } from '@/hooks/queries/use-admin'
import { Skeleton } from '@/components/ui/skeleton'

export const AdminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { data: analytics, isLoading } = useAdminAnalytics()

  const stats = [
    {
      title: 'Total Companies',
      value: analytics?.total_companies?.toString() || '0',
      description: `${analytics?.active_companies || 0} active`,
      icon: Building2,
      isLoading,
    },
    {
      title: 'Total Users',
      value: analytics?.total_users?.toString() || '0',
      description: `${analytics?.active_users || 0} active`,
      icon: Users,
      isLoading,
    },
    {
      title: 'Subscriptions',
      value: analytics?.total_subscriptions?.toString() || '0',
      description: `${analytics?.active_subscriptions || 0} active`,
      icon: CreditCard,
      isLoading,
    },
    {
      title: 'Total Products',
      value: analytics?.total_products?.toString() || '0',
      description: 'Across all companies',
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
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage the entire ERP platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  {stat.isLoading ? (
                    <Skeleton className="h-8 w-20 mb-2" />
                  ) : (
                    <div className="text-2xl font-bold">{stat.value}</div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {analytics && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Companies by Plan</CardTitle>
                <CardDescription>Subscription plan distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.companies_by_plan || {}).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{plan}</span>
                      <span className="text-sm font-medium">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>Role distribution across platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analytics.users_by_role || {}).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                      <span className="text-sm font-medium">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}



