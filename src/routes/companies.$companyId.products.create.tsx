import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/ProductForm'
import { useCreateProduct } from '@/hooks/queries/use-products'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const CreateProductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/create',
  component: CreateProductPage,
})

function CreateProductPage() {
  const navigate = useNavigate()
  const { companyId } = CreateProductRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const createProduct = useCreateProduct(Number(companyId))
  const { data: suppliersResponse } = useSuppliers(Number(companyId))
  
  const suppliers = suppliersResponse?.data || []

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleSubmit = async (data: any) => {
    // Convert supplier_id from string to number, or set to undefined if empty
    const productData = {
      ...data,
      supplier_id: data.supplier_id ? parseInt(data.supplier_id) : undefined,
      supplier_cost: data.supplier_cost || undefined,
    }
    
    const result = await createProduct.mutateAsync(productData)
    if (result.success && result.data) {
      navigate({ to: `/companies/${companyId}/products/${result.data.id}` })
    }
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/products` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Product
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Add a new product to your inventory
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Enter the basic details for your new product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              suppliers={suppliers}
              onSubmit={handleSubmit}
              isLoading={createProduct.isPending}
              submitLabel="Create Product"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



