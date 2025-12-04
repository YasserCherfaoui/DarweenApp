import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Search, CheckCircle2, XCircle } from 'lucide-react'
import { rootRoute } from '@/main'
import { useAdminCompanies } from '@/hooks/queries/use-admin'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import type { CompanySummary } from '@/types/api'

export const AdminCompaniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/companies',
  component: AdminCompaniesPage,
})

function AdminCompaniesPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const limit = 20

  const { data, isLoading } = useAdminCompanies({
    page,
    limit,
    search: search || undefined,
    is_active: isActive,
  })

  const companies = data?.companies || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Companies
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage all companies on the platform
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
                    placeholder="Search companies..."
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Companies ({total})</CardTitle>
            <CardDescription>All companies registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No companies found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company: CompanySummary) => (
                  <Link
                    key={company.id}
                    to="/admin/companies/$companyId"
                    params={{ companyId: company.id.toString() }}
                    className="block"
                  >
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Building2 className="h-8 w-8 text-gray-400" />
                            <div>
                              <h3 className="font-semibold">{company.name}</h3>
                              <p className="text-sm text-gray-500">Code: {company.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {company.user_count} users • {company.product_count} products • {company.franchise_count} franchises
                              </p>
                              <p className="text-sm text-gray-500">
                                Plan: {company.subscription_plan} • Status: {company.subscription_status}
                              </p>
                            </div>
                            <Badge variant={company.is_active ? 'default' : 'secondary'}>
                              {company.is_active ? (
                                <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                              ) : (
                                <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                              )}
                            </Badge>
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



