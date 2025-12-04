import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Package, Store, CreditCard } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminAnalytics } from '@/hooks/queries/use-admin'
import { Skeleton } from '@/components/ui/skeleton'

export const AdminAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: AdminAnalyticsPage,
})

function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useAdminAnalytics()

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Analytics
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Overview of platform-wide metrics and statistics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.total_companies || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics?.active_companies || 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics?.active_users || 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.total_products || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Franchises</CardTitle>
              <Store className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.total_franchises || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.total_subscriptions || 0}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics?.active_subscriptions || 0} active
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {analytics && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Companies by Plan</CardTitle>
                <CardDescription>Distribution of subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.companies_by_plan || {}).map(([plan, count]) => {
                    const countNum = Number(count)
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{plan}</span>
                          <span className="text-sm text-gray-500">{countNum}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(countNum / (analytics.total_companies || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>Role distribution across platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.users_by_role || {}).map(([role, count]) => {
                    const countNum = Number(count)
                    return (
                      <div key={role}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{role.replace('_', ' ')}</span>
                          <span className="text-sm text-gray-500">{countNum}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(countNum / (analytics.total_users || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}



