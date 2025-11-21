import { createRoute, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductForm } from '@/components/products/ProductForm'
import { useProduct, useUpdateProduct } from '@/hooks/queries/use-products'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const EditProductRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/$productId/edit',
  component: EditProductPage,
})

function EditProductPage() {
  const navigate = useNavigate()
  const { companyId, productId } = EditProductRoute.useParams()
  const { data: product, isLoading } = useProduct(Number(companyId), Number(productId))
  const updateProduct = useUpdateProduct(Number(companyId), Number(productId))
  const { data: suppliersResponse } = useSuppliers(Number(companyId))
  
  const suppliers = suppliersResponse?.data || []

  const handleSubmit = async (data: any) => {
    // Convert supplier_id from string to number, or set to undefined if empty
    const productData = {
      ...data,
      supplier_id: data.supplier_id ? parseInt(data.supplier_id) : undefined,
      supplier_cost: data.supplier_cost || undefined,
    }
    
    await updateProduct.mutateAsync(productData)
    navigate({ to: `/companies/${companyId}/products/${productId}` })
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!product) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <Button onClick={() => navigate({ to: `/companies/${companyId}/products` })}>
            Back to Products
          </Button>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/products/${productId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Product
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Update your product information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Make changes to your product details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              initialData={product}
              suppliers={suppliers}
              onSubmit={handleSubmit}
              isLoading={updateProduct.isPending}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



