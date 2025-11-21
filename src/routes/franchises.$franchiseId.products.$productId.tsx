import { createRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProduct } from '@/hooks/queries/use-products'
import { useFranchise, useFranchisePricing } from '@/hooks/queries/use-franchises'
import { ArrowLeft, Truck, DollarSign } from 'lucide-react'
import { rootRoute } from '@/main'
import type { FranchisePricing } from '@/types/api'

export const FranchiseProductDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/products/$productId',
  component: FranchiseProductDetailsPage,
})

function FranchiseProductDetailsPage() {
  const navigate = useNavigate()
  const { franchiseId, productId } = FranchiseProductDetailsRoute.useParams()
  const franchiseIdNum = Number(franchiseId)
  
  const { data: franchise, isLoading: franchiseLoading } = useFranchise(franchiseIdNum)
  const companyId = franchise?.parent_company_id || 0
  const { data: product, isLoading: productLoading } = useProduct(companyId, Number(productId))
  const { data: pricing, isLoading: pricingLoading } = useFranchisePricing(franchiseIdNum)

  // Create a map of variant ID to franchise pricing
  const pricingMap = useMemo(() => {
    if (!pricing) return new Map<number, FranchisePricing>()
    const map = new Map<number, FranchisePricing>()
    pricing.forEach((p) => {
      map.set(p.product_variant_id, p)
    })
    return map
  }, [pricing])

  const isLoading = franchiseLoading || productLoading || pricingLoading

  // Get effective retail price for a variant (franchise override > variant > product base)
  const getRetailPrice = (variant: any) => {
    const franchisePricing = pricingMap.get(variant.id)
    if (franchisePricing?.retail_price) {
      return franchisePricing.retail_price
    }
    if (variant.retail_price) {
      return variant.retail_price
    }
    return product?.base_retail_price || 0
  }

  // Get effective wholesale price for a variant (franchise override > variant > product base)
  const getWholesalePrice = (variant: any) => {
    const franchisePricing = pricingMap.get(variant.id)
    if (franchisePricing?.wholesale_price) {
      return franchisePricing.wholesale_price
    }
    if (variant.wholesale_price) {
      return variant.wholesale_price
    }
    return product?.base_wholesale_price || 0
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
          <Button onClick={() => navigate({ to: `/franchises/${franchiseId}/products` })}>
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
              onClick={() => navigate({ to: `/franchises/${franchiseId}/products` })}
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
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="mt-1">{product.description || 'No description provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>View variants and their pricing for this franchise</CardDescription>
          </CardHeader>
          <CardContent>
            {product.variants && product.variants.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Wholesale Price</TableHead>
                      <TableHead>Pricing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant) => {
                      const franchisePricing = pricingMap.get(variant.id)
                      const hasFranchisePricing = !!franchisePricing
                      
                      // If custom pricing exists, only show custom prices (don't show defaults)
                      // If no custom pricing, show effective prices (variant or product base)
                      let retailPrice: number | null = null
                      let wholesalePrice: number | null = null
                      
                      if (hasFranchisePricing) {
                        // Only show custom prices, don't show defaults
                        retailPrice = franchisePricing.retail_price ?? null
                        wholesalePrice = franchisePricing.wholesale_price ?? null
                      } else {
                        // No custom pricing, show effective prices
                        retailPrice = getRetailPrice(variant)
                        wholesalePrice = getWholesalePrice(variant)
                      }

                      return (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">
                            {variant.name || 'Default'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {variant.sku || product.sku}
                          </TableCell>
                          <TableCell>
                            {retailPrice !== null ? (
                              <span className="font-medium">${retailPrice.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {wholesalePrice !== null ? (
                              <span className="font-medium">${wholesalePrice.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasFranchisePricing ? (
                              <Badge variant="secondary">Custom</Badge>
                            ) : (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No variants available for this product</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

