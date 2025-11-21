import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductsTable } from '@/components/products/ProductsTable'
import { useProducts, useDeleteProduct } from '@/hooks/queries/use-products'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { Plus, Package, ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const CompanyProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products',
  component: CompanyProductsPage,
})

function CompanyProductsPage() {
  const navigate = useNavigate()
  const { companyId } = CompanyProductsRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const { data: productsData, isLoading } = useProducts(Number(companyId), {
    page: 1,
    limit: 20,
  })
  const deleteProduct = useDeleteProduct(Number(companyId))

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleDelete = async (productId: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(productId)
    }
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Company
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Products
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage your products and inventory
              </p>
            </div>
            <Link to={`/companies/${companyId}/products/create`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        ) : productsData && productsData.data && productsData.data.length > 0 ? (
          <ProductsTable
            products={productsData.data}
            companyId={Number(companyId)}
            onDelete={handleDelete}
          />
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Start by adding your first product. You can then create variants with different sizes, colors, and prices.
              </p>
              <Link to={`/companies/${companyId}/products/create`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Product
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}



