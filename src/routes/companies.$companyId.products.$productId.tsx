import { createRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductVariantsTable } from '@/components/products/ProductVariantsTable'
import { VariantForm } from '@/components/products/VariantForm'
import { 
  useProduct,
  useCreateProductVariant,
  useDeleteProductVariant,
} from '@/hooks/queries/use-products'
import { useSupplier } from '@/hooks/queries/use-suppliers'
import { ArrowLeft, Edit, Plus, Layers, Truck, DollarSign } from 'lucide-react'
import { rootRoute } from '@/main'
import type { ProductVariant } from '@/types/api'

export const ProductDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/$productId',
  component: ProductDetailsPage,
})

function ProductDetailsPage() {
  const navigate = useNavigate()
  const { companyId, productId} = ProductDetailsRoute.useParams()
  const { data: product, isLoading } = useProduct(Number(companyId), Number(productId))
  const createVariant = useCreateProductVariant(Number(companyId), Number(productId))
  const deleteVariant = useDeleteProductVariant(Number(companyId), Number(productId))
  
  // Fetch supplier info if product has a supplier
  const { data: supplier } = useSupplier(
    Number(companyId), 
    product?.supplier_id || 0,
  )
  
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)

  const handleCreateVariant = async (data: {
    name: string
    sku: string
    retail_price?: number
    wholesale_price?: number
    use_parent_pricing?: boolean
    attributes?: Record<string, any>
  }) => {
    await createVariant.mutateAsync(data)
    setShowVariantDialog(false)
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (confirm('Are you sure you want to delete this variant?')) {
      await deleteVariant.mutateAsync(variantId)
    }
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: `/companies/${companyId}/products` })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                SKU: {product.sku}
              </p>
            </div>
            <Badge variant={product.is_active ? 'default' : 'secondary'}>
              {product.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Link to={`/companies/${companyId}/products/${productId}/edit` as any}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Basic information about this product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="mt-1 text-lg">{product.name}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                SKU
              </p>
              <p className="mt-1 font-mono">{product.sku}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Retail Price
                </p>
                <p className="mt-1 text-lg font-semibold">${product.base_retail_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Wholesale Price
                </p>
                <p className="mt-1 text-lg font-semibold">${product.base_wholesale_price.toFixed(2)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="mt-1">{product.description || 'No description provided'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        {product.supplier_id && supplier && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
              <CardDescription>Supplier details for this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</p>
                    <Link
                      to={`/companies/${companyId}/suppliers/${supplier.id}` as any}
                      className="text-base font-medium hover:text-primary transition-colors"
                    >
                      {supplier.name}
                    </Link>
                  </div>
                </div>
                {product.supplier_cost && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier Cost</p>
                      <p className="text-base font-semibold">${product.supplier_cost.toFixed(2)}</p>
                      {product.base_retail_price && (
                        <p className="text-sm text-gray-500">
                          Margin: ${(product.base_retail_price - product.supplier_cost).toFixed(2)} 
                          ({(((product.base_retail_price - product.supplier_cost) / product.base_retail_price) * 100).toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>Different variations of this product</CardDescription>
            </div>
            <div className="flex gap-2">
              <Link to={`/companies/${companyId}/products/${productId}/variants/bulk` as any}>
                <Button variant="outline">
                  <Layers className="mr-2 h-4 w-4" />
                  Bulk Create
                </Button>
              </Link>
              <Button onClick={() => setShowVariantDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {product.variants && product.variants.length > 0 ? (
              <ProductVariantsTable
                variants={product.variants}
                onEdit={setEditingVariant}
                onDelete={handleDeleteVariant}
                companyId={Number(companyId)}
                productId={Number(productId)}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No variants yet</p>
                <div className="flex gap-2 justify-center">
                  <Link to={`/companies/${companyId}/products/${productId}/variants/bulk` as any}>
                    <Button variant="outline">
                      <Layers className="mr-2 h-4 w-4" />
                      Bulk Create Variants
                    </Button>
                  </Link>
                  <Button onClick={() => setShowVariantDialog(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Single Variant
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Product Variant</DialogTitle>
            <DialogDescription>
              Create a new variant for {product.name}
            </DialogDescription>
          </DialogHeader>
          <VariantForm
            onSubmit={handleCreateVariant}
            isLoading={createVariant.isPending}
            submitLabel="Create Variant"
          />
        </DialogContent>
      </Dialog>

      {editingVariant && (
        <Dialog open={!!editingVariant} onOpenChange={() => setEditingVariant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product Variant</DialogTitle>
              <DialogDescription>
                Update the variant details
              </DialogDescription>
            </DialogHeader>
            <VariantForm
              initialData={editingVariant}
              onSubmit={async (_data) => {
                // We would need to implement updateVariant mutation here
                setEditingVariant(null)
              }}
              submitLabel="Update Variant"
            />
          </DialogContent>
        </Dialog>
      )}
    </RoleBasedLayout>
  )
}



