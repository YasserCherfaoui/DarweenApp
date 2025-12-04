import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Building2, Mail, Calendar } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminUser, useUpdateAdminUser } from '@/hooks/queries/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'

export const AdminUserDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users/$userId',
  component: AdminUserDetailPage,
})

function AdminUserDetailPage() {
  const { userId } = AdminUserDetailRoute.useParams()
  const id = parseInt(userId, 10)
  const { data: user, isLoading } = useAdminUser(id)
  const updateUser = useUpdateAdminUser(id)
  const [isActive, setIsActive] = useState(user?.is_active ?? true)

  useEffect(() => {
    if (user) {
      setIsActive(user.is_active)
    }
  }, [user])

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked)
    try {
      await updateUser.mutateAsync({ is_active: checked })
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl">
              {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.company_count}</div>
              <p className="text-xs text-gray-500 mt-1">Associated companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Email Status</CardTitle>
              <Mail className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                {user.email_verified ? 'Verified' : 'Unverified'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Manage user status and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">User Status</Label>
                <p className="text-sm text-gray-500">
                  {isActive ? 'User can log in and use the platform' : 'User account is inactive'}
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={handleToggleActive}
                disabled={updateUser.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}



