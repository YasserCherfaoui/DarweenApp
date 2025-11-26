import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useFranchise, useFranchisePricing } from '@/hooks/queries/use-franchises'
import { useProducts } from '@/hooks/queries/use-products'
import { ArrowLeft, Package, Eye } from 'lucide-react'
import { rootRoute } from '@/main'
import type { FranchisePricing } from '@/types/api'

export const FranchiseProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/products',
  component: FranchiseProductsPage,
})

function FranchiseProductsPage() {
  const navigate = useNavigate()
  const { franchiseId } = FranchiseProductsRoute.useParams()
  const franchiseIdNum = Number(franchiseId)

  const { data: franchise, isLoading: franchiseLoading } = useFranchise(franchiseIdNum)
  const { data: pricing, isLoading: pricingLoading } = useFranchisePricing(franchiseIdNum)
  const companyId = franchise?.parent_company_id || 0
  const { data: productsData, isLoading: productsLoading } = useProducts(
    companyId,
    { page: 1, limit: 20 }
  )

  // Create a map of variant ID to franchise pricing
  const pricingMap = useMemo(() => {
    if (!pricing) return new Map<number, FranchisePricing>()
    const map = new Map<number, FranchisePricing>()
    pricing.forEach((p) => {
      map.set(p.product_variant_id, p)
    })
    return map
  }, [pricing])

  const isLoading = franchiseLoading || productsLoading || pricingLoading

  // Get effective retail price for a variant (franchise override > variant > product base)
  const getRetailPrice = (product: any, variant: any) => {
    const franchisePricing = pricingMap.get(variant.id)
    if (franchisePricing?.retail_price) {
      return franchisePricing.retail_price
    }
    if (variant.retail_price) {
      return variant.retail_price
    }
    return product.base_retail_price
  }

  // Get effective wholesale price for a variant (franchise override > variant > product base)
  const getWholesalePrice = (product: any, variant: any) => {
    const franchisePricing = pricingMap.get(variant.id)
    if (franchisePricing?.wholesale_price) {
      return franchisePricing.wholesale_price
    }
    if (variant.wholesale_price) {
      return variant.wholesale_price
    }
    return product.base_wholesale_price
  }

  // Calculate price range for a product based on its variants
  const getProductPriceRange = (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      // No variants, use product base prices
      return {
        retailMin: product.base_retail_price,
        retailMax: product.base_retail_price,
        wholesaleMin: product.base_wholesale_price,
        wholesaleMax: product.base_wholesale_price,
        hasCustomPricing: false,
      }
    }

    const retailPrices = product.variants.map((v: any) => getRetailPrice(product, v))
    const wholesalePrices = product.variants.map((v: any) => getWholesalePrice(product, v))
    const hasCustomPricing = product.variants.some((v: any) => pricingMap.has(v.id))

    return {
      retailMin: Math.min(...retailPrices),
      retailMax: Math.max(...retailPrices),
      wholesaleMin: Math.min(...wholesalePrices),
      wholesaleMax: Math.max(...wholesalePrices),
      hasCustomPricing,
    }
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/franchises/${franchiseId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Franchise
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Products
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                View products and pricing for {franchise?.name || 'this franchise'}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card className="p-6">
            <Skeleton className="h-64 w-full" />
          </Card>
        ) : productsData && productsData.data && productsData.data.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Retail Price</TableHead>
                  <TableHead>Wholesale Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.data.map((product) => {
                  const priceRange = getProductPriceRange(product)
                  const retailPriceDisplay = priceRange.retailMin === priceRange.retailMax
                    ? `$${priceRange.retailMin.toFixed(2)}`
                    : `$${priceRange.retailMin.toFixed(2)} - $${priceRange.retailMax.toFixed(2)}`
                  const wholesalePriceDisplay = priceRange.wholesaleMin === priceRange.wholesaleMax
                    ? `$${priceRange.wholesaleMin.toFixed(2)}`
                    : `$${priceRange.wholesaleMin.toFixed(2)} - $${priceRange.wholesaleMax.toFixed(2)}`

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <span className="font-medium">{retailPriceDisplay}</span>
                        {priceRange.hasCustomPricing && (
                          <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{wholesalePriceDisplay}</span>
                        {priceRange.hasCustomPricing && (
                          <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell>{product.variants?.length || 0}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/franchises/${franchiseId}/products/${product.id}` as any}>
                            <Button variant="ghost" size="icon-sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                No products are available for this franchise. Products are managed by the parent company.
              </p>
            </div>
          </Card>
        )}
      </div>
    </RoleBasedLayout>
  )
}

