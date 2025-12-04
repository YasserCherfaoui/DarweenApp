import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Users, Package, Store, CreditCard } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminCompany, useUpdateAdminCompany } from '@/hooks/queries/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

export const AdminCompanyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/companies/$companyId',
  component: AdminCompanyDetailPage,
})

function AdminCompanyDetailPage() {
  const { companyId } = AdminCompanyDetailRoute.useParams()
  const id = parseInt(companyId, 10)
  const { data: company, isLoading } = useAdminCompany(id)
  const updateCompany = useUpdateAdminCompany(id)
  const [isActive, setIsActive] = useState(company?.is_active ?? true)

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked)
    try {
      await updateCompany.mutateAsync({ is_active: checked })
    } catch (error) {
      setIsActive(!checked) // Revert on error
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AdminLayout>
    )
  }

  if (!company) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Company not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {company.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Company Code: {company.code}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.user_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.product_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Franchises</CardTitle>
              <Store className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{company.franchise_count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium capitalize">{company.subscription_plan}</div>
              <Badge variant={company.subscription_status === 'active' ? 'default' : 'secondary'} className="mt-1">
                {company.subscription_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
            <CardDescription>Manage company status and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Company Status</Label>
                <p className="text-sm text-gray-500">
                  {isActive ? 'Company is active and can be used' : 'Company is inactive'}
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={updateCompany.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

