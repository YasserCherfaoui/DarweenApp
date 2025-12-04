import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Search, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminUsers } from '@/hooks/queries/use-admin'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import type { UserSummary } from '@/types/api'

export const AdminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [emailVerified, setEmailVerified] = useState<boolean | undefined>(undefined)
  const limit = 20

  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    search: search || undefined,
    is_active: isActive,
    email_verified: emailVerified,
  })

  const users = data?.users || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Users
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage all users on the platform
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                onValueChange={(value) => {
                  setIsActive(value === 'all' ? undefined : value === 'active')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={emailVerified === undefined ? 'all' : emailVerified ? 'verified' : 'unverified'}
                onValueChange={(value) => {
                  setEmailVerified(value === 'all' ? undefined : value === 'verified')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users ({total})</CardTitle>
            <CardDescription>All users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user: UserSummary) => (
                  <Link
                    key={user.id}
                    to="/admin/users/$userId"
                    params={{ userId: user.id.toString() }}
                    className="block"
                  >
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {user.first_name} {user.last_name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {user.company_count} companies
                              </p>
                              <p className="text-sm text-gray-500">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                {user.is_active ? (
                                  <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                                ) : (
                                  <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                                )}
                              </Badge>
                              {user.email_verified && (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}



