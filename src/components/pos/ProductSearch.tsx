import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Plus } from 'lucide-react'
import type { ProductVariant, Product, ProductVariantSearchResponse } from '@/types/api'
import { useProducts } from '@/hooks/queries/use-products'
import { useSearchProductsForExitBill } from '@/hooks/queries/use-warehouse-bills'

interface ProductSearchProps {
  companyId: number
  franchiseId?: number | null
  onAddToCart: (variant: ProductVariant & { product?: Product }, quantity: number) => void
  disabled?: boolean
}

export function ProductSearch({ companyId, franchiseId, onAddToCart, disabled = false }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredVariants, setFilteredVariants] = useState<Array<ProductVariant & { product?: Product }>>([])
  const [pendingEnterPress, setPendingEnterPress] = useState(false)
  
  // Use API search when franchiseId is provided, otherwise use client-side filtering
  const { data: searchResults, isLoading: isSearchLoading, isFetching: isSearchFetching } = useSearchProductsForExitBill(
    companyId,
    franchiseId || null,
    searchQuery
  )
  const { data: productsData } = useProducts(companyId, { page: 1, limit: 100 })

  // Reset pending Enter press when search query changes
  useEffect(() => {
    setPendingEnterPress(false)
  }, [searchQuery])

  useEffect(() => {
    // If franchiseId is provided, ONLY use API search results (never client-side filtering)
    // This ensures we always have franchise pricing data
    if (franchiseId) {
      // Wait for API search results - don't use client-side filtering
      if (searchResults?.data) {
        const variants: Array<ProductVariant & { product?: Product }> = searchResults.data.map(
          (result: ProductVariantSearchResponse) => ({
            id: result.variant_id,
            product_id: result.product_id,
            name: result.variant_name,
            sku: result.variant_sku,
            retail_price: result.effective_retail_price,
            wholesale_price: result.effective_wholesale_price,
            is_active: true,
            product: {
              id: result.product_id,
              name: result.product_name,
              sku: result.product_sku,
              base_retail_price: result.base_retail_price,
              base_wholesale_price: result.base_wholesale_price,
            } as Product,
            // Store search result data for pricing display
            _searchResult: result,
          } as ProductVariant & { product?: Product; _searchResult?: ProductVariantSearchResponse })
        )
        setFilteredVariants(variants)
        
        // Auto-add if Enter was pressed while loading and we now have exactly one result
        if (pendingEnterPress && variants.length === 1) {
          const variant = variants[0]
          const searchResult = (variant as any)._searchResult as ProductVariantSearchResponse | undefined
          if (searchResult) {
            onAddToCart(variant, 1)
            setSearchQuery('')
            setPendingEnterPress(false)
          }
        }
      } else if (!isSearchLoading && !isSearchFetching && searchQuery.trim()) {
        // Search completed but no results, clear variants and reset pending Enter
        setFilteredVariants([])
        setPendingEnterPress(false)
      }
      // If still loading, keep existing variants (or empty) - don't update yet
      return
    }

    // Otherwise (no franchiseId), use client-side filtering
    if (!productsData?.data) return

    const query = searchQuery.toLowerCase()
    const variants: Array<ProductVariant & { product?: Product }> = []

    productsData.data.forEach((product: Product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          const matchesSearch =
            variant.name.toLowerCase().includes(query) ||
            variant.sku.toLowerCase().includes(query) ||
            product.name.toLowerCase().includes(query)

          if (matchesSearch && variant.is_active) {
            variants.push({ ...variant, product })
          }
        })
      }
    })

    setFilteredVariants(variants.slice(0, 10))
  }, [searchQuery, productsData, searchResults, franchiseId, isSearchLoading, isSearchFetching])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      // If we have exactly one variant ready, try to add it
      if (filteredVariants.length === 1) {
        // If franchiseId is provided, we MUST wait for API search to complete
        // to get franchise pricing. Don't add if search is still loading/fetching.
        if (franchiseId && (isSearchLoading || isSearchFetching)) {
          // Search is still in progress, mark that Enter was pressed
          // We'll auto-add when search completes (handled in useEffect)
          setPendingEnterPress(true)
          return
        }
        
        // Only add if we have a valid variant with proper pricing data
        const variant = filteredVariants[0]
        if (franchiseId) {
          // For franchise searches, ensure we have search result data with franchise pricing
          const searchResult = (variant as any)._searchResult as ProductVariantSearchResponse | undefined
          if (!searchResult) {
            // Search result not available yet, mark Enter as pending
            setPendingEnterPress(true)
            return
          }
        }
        
        onAddToCart(variant, 1)
        setSearchQuery('')
        setPendingEnterPress(false)
      } else if (franchiseId && searchQuery.trim() && (isSearchLoading || isSearchFetching)) {
        // User pressed Enter but search is still loading - mark as pending
        // This handles barcode scanner case where Enter comes immediately after SKU
        setPendingEnterPress(true)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={disabled ? "Please select a franchise first" : "Search products by name or SKU..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          disabled={disabled}
        />
      </div>

      {!disabled && franchiseId && searchQuery && (isSearchLoading || isSearchFetching) && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Searching for franchise pricing...
        </div>
      )}

      {!disabled && searchQuery && filteredVariants.length > 0 && (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredVariants.map((variant) => {
            const searchResult = (variant as any)._searchResult as ProductVariantSearchResponse | undefined
            // Use effective wholesale price for exit bills, retail price otherwise
            const price = franchiseId
              ? (searchResult?.effective_wholesale_price || variant.wholesale_price || variant.product?.base_wholesale_price || 0)
              : (variant.retail_price || variant.product?.base_retail_price || 0)
            
            const hasFranchisePricing = searchResult && (
              searchResult.franchise_retail_price !== undefined ||
              searchResult.franchise_wholesale_price !== undefined
            )
            
            return (
              <Card key={variant.id} className="hover:bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{variant.product?.name} - {variant.name}</div>
                      <div className="text-sm text-gray-500">SKU: {variant.sku}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-primary">
                          ${price.toFixed(2)}
                        </div>
                        {hasFranchisePricing && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Franchise Price
                          </span>
                        )}
                      </div>
                      {franchiseId && searchResult && (
                        <div className="text-xs text-gray-400 mt-1">
                          Base: ${searchResult.base_wholesale_price.toFixed(2)}
                          {searchResult.franchise_wholesale_price && (
                            <span className="ml-2">
                              → ${searchResult.franchise_wholesale_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onAddToCart(variant, 1)
                        setSearchQuery('')
                      }}
                      disabled={disabled}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {!disabled && searchQuery && filteredVariants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No products found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}

