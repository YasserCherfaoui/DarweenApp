import { CompanyCard } from '@/components/companies/CompanyCard'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompanies } from '@/hooks/queries/use-companies'
import { companyStore } from '@/stores/company-store'
import { portalStore } from '@/stores/portal-store'
import { rootRoute } from '@/main'
import { createRoute, Link, redirect } from '@tanstack/react-router'
import { Building2, Plus, Briefcase, CheckCircle2 } from 'lucide-react'
import { useStore } from '@tanstack/react-store'

export const CompaniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies',
  component: CompaniesPage,
  beforeLoad: async () => {
    const portalState = portalStore.state
    if (portalState.selectedPortalType === 'franchise' && portalState.selectedPortalId) {
      throw redirect({
        to: `/franchises/${portalState.selectedPortalId}` as any,
        replace: true,
      })
    }
  },
})

function CompaniesPage() {
  const { data: companies, isLoading } = useCompanies()
  const { selectedCompanyId } = useStore(companyStore)
  const { selectedPortalId, selectedPortal } = useStore(portalStore)
  
  // Determine active company ID from portal or direct selection
  const activeCompanyId = selectedPortal?.type === 'company' 
    ? selectedPortalId 
    : selectedCompanyId

  const activeCompaniesCount = companies?.filter(c => c.is_active).length || 0
  const totalCompaniesCount = companies?.length || 0

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Companies
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Company Management Hub - Manage your companies, organizations, and business entities
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select a company to access its dashboard, manage products, inventory, orders, and more
            </p>
          </div>
          <Link to="/companies/create">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Company
            </Button>
          </Link>
        </div>

        {/* Stats Overview - Show when companies exist */}
        {!isLoading && companies && companies.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Companies</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {totalCompaniesCount}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Companies</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {activeCompaniesCount}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                      {totalCompaniesCount - activeCompaniesCount}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
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
              <CompanyCard 
                key={company.id} 
                company={company}
                isSelected={company.id === activeCompanyId}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed">
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
                  <Building2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No Companies Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2 max-w-lg">
                  Get started by creating your first company. Companies are the central hub for managing your business operations.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-lg">
                  Once created, you'll be able to add products, manage inventory, process orders, set up franchises, and more.
                </p>
                <Link to="/companies/create">
                  <Button size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Create Your First Company
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}



