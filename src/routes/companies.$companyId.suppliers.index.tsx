import { createRoute, Link, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SupplierCard } from '@/components/suppliers/SupplierCard'
import { useSuppliers, useDeleteSupplier } from '@/hooks/queries/use-suppliers'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { Plus, Building2 } from 'lucide-react'
import { rootRoute } from '@/main'

export const CompanySuppliersIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers',
  component: CompanySuppliersPage,
})

function CompanySuppliersPage() {
  const { companyId } = useParams({ from: '/companies/$companyId/suppliers' })
  const companyIdNum = parseInt(companyId)
  const { data: company } = useCompany(companyIdNum)
  const { selectCompany } = useSelectedCompany()
  const { data: suppliersResponse, isLoading } = useSuppliers(companyIdNum)
  const deleteSupplier = useDeleteSupplier(companyIdNum)

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleDelete = (supplierId: number) => {
    deleteSupplier.mutate(supplierId)
  }

  const suppliers = suppliersResponse?.data || []

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Suppliers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Manage your suppliers and vendor relationships
            </p>
          </div>
          <Link to={`/companies/${companyId}/suppliers/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Supplier
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
        ) : suppliers && suppliers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SupplierCard 
                key={supplier.id} 
                supplier={supplier}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No suppliers yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Get started by adding your first supplier. You'll be able to track products, contact information, and more.
              </p>
              <Link to={`/companies/${companyId}/suppliers/create`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Supplier
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {suppliersResponse && suppliersResponse.total_pages > 1 && (
          <div className="flex justify-center gap-2">
            <p className="text-sm text-gray-500">
              Page {suppliersResponse.page} of {suppliersResponse.total_pages}
            </p>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  )
}



