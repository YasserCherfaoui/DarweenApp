import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { ProductVariant } from '@/types/api'
import { useProducts } from '@/hooks/queries/use-products'

interface AddExtraItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  onAddItem: (variant: ProductVariant) => void
  existingVariantIds: number[] // Variant IDs already in the bill
}

export function AddExtraItemDialog({
  open,
  onOpenChange,
  companyId,
  onAddItem,
  existingVariantIds,
}: AddExtraItemDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: productsData } = useProducts(companyId, { page: 1, limit: 100 })

  // Filter products and variants
  const filteredVariants: (ProductVariant & { productName?: string; productSku?: string })[] = []
  
  if (productsData?.data) {
    productsData.data.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          // Skip if already in bill
          if (existingVariantIds.includes(variant.id)) {
            return
          }

          // Filter by search query
          const query = searchQuery.toLowerCase()
          const matchesSearch =
            !query ||
            variant.name.toLowerCase().includes(query) ||
            variant.sku.toLowerCase().includes(query) ||
            product.name.toLowerCase().includes(query) ||
            product.sku.toLowerCase().includes(query)

          if (matchesSearch && variant.is_active) {
            filteredVariants.push({
              ...variant,
              productName: product.name,
              productSku: product.sku,
            })
          }
        })
      }
    })
  }

  const handleAddItem = (variant: ProductVariant & { productName?: string }) => {
    onAddItem(variant)
    setSearchQuery('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Extra Item</DialogTitle>
          <DialogDescription>
            Search and add a product variant that is not in the exit bill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by product name, SKU, or variant name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results List */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {filteredVariants.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchQuery
                  ? 'No variants found matching your search'
                  : 'Start typing to search for product variants'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => handleAddItem(variant)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {variant.productName} - {variant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {variant.sku || variant.productSku}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddItem(variant)
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
