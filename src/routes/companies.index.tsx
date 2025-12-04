import { CompanyCard } from '@/components/companies/CompanyCard'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanies } from '@/hooks/queries/use-companies'
import { rootRoute } from '@/main'
import { portalStore } from '@/stores/portal-store'
import { createRoute, Link, redirect } from '@tanstack/react-router'
import { Building2, Plus } from 'lucide-react'

export const CompaniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies',
  component: CompaniesPage,
  beforeLoad: async () => {
    const portalState = portalStore.state
    if (portalState.selectedPortalType === 'franchise' && portalState.selectedPortalId) {
      throw redirect({
        to: `/franchises/${portalState.selectedPortalId}`,
        replace: true,
      })
    }
  },
})

function CompaniesPage() {
  const { data: companies, isLoading } = useCompanies()

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Companies
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage your companies and organizations
            </p>
          </div>
          <Link to="/companies/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Company
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </Card>
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Get started by creating your first company. You'll be able to add products, manage inventory, and more.
              </p>
              <Link to="/companies/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Company
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}



