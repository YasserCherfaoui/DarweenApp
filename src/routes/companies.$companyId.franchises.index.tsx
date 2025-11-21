import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FranchiseCard } from '@/components/franchises/FranchiseCard'
import { useCompanyFranchises } from '@/hooks/queries/use-franchises'
import { Plus, Store } from 'lucide-react'
import { rootRoute } from '@/main'

export const CompanyFranchisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises',
  component: CompanyFranchisesPage,
})

function CompanyFranchisesPage() {
  const { companyId } = CompanyFranchisesRoute.useParams()
  const navigate = useNavigate()
  const companyIdNum = Number(companyId)

  const { data: franchises, isLoading } = useCompanyFranchises(companyIdNum)

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Franchises
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage franchise locations for this company
            </p>
          </div>
          <Link to={`/companies/${companyId}/franchises/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Franchise
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
        ) : franchises && franchises.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {franchises.map((franchise) => (
              <FranchiseCard key={franchise.id} franchise={franchise} />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <Store className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No franchises yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Create your first franchise location to expand your business operations.
              </p>
              <Link to={`/companies/${companyId}/franchises/create`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Franchise
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}


