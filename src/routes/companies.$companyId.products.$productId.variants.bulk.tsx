import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { BulkVariantForm } from '@/components/products/BulkVariantForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useBulkCreateProductVariants, useProduct } from '@/hooks/queries/use-products'
import { rootRoute } from '@/main'
import type { BulkCreateProductVariantsRequest } from '@/types/api'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'

export const BulkCreateVariantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/$productId/variants/bulk',
  component: BulkCreateVariantsPage,
})

function BulkCreateVariantsPage() {
  const navigate = useNavigate()
  const { companyId, productId } = BulkCreateVariantsRoute.useParams()
  const companyIdNum = Number(companyId)
  const productIdNum = Number(productId)

  const { data: product, isLoading: isLoadingProduct } = useProduct(companyIdNum, productIdNum)
  const bulkCreateVariants = useBulkCreateProductVariants(companyIdNum, productIdNum)

  const handleSubmit = async (data: BulkCreateProductVariantsRequest) => {
    const result = await bulkCreateVariants.mutateAsync(data)
    if (result.success) {
      navigate({ to: `/companies/${companyId}/products/${productId}` })
    }
  }

  if (isLoadingProduct) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </RoleBasedLayout>
    )
  }

  if (!product) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Not Found</CardTitle>
              <CardDescription>
                The product you're looking for doesn't exist or you don't have access to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => navigate({ to: `/companies/${companyId}/products` })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
            Bulk Create Variants
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Generate multiple variants for <span className="font-semibold">{product.name}</span> (SKU: {product.sku})
          </p>
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Product Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Base SKU</p>
                <p className="font-medium font-mono">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Base Retail Price</p>
                <p className="font-medium">${product.base_retail_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Base Wholesale Price</p>
                <p className="font-medium">${product.base_wholesale_price.toFixed(2)}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>SKU Pattern:</strong> Variants will be created with SKUs following the pattern: 
                <code className="ml-2 px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-mono">
                  {product.sku}&gt;VALUE1&gt;VALUE2
                </code>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Example: {product.sku}&gt;RED&gt;39
              </p>
            </div>
          </CardContent>
        </Card>

        <BulkVariantForm
          onSubmit={handleSubmit}
          isLoading={bulkCreateVariants.isPending}
        />
      </div>
    </RoleBasedLayout>
  )
}

